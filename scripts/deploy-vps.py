import os
import posixpath
import paramiko

HOST = os.environ.get('VPS_HOST', '8.222.129.216')
PORT = int(os.environ.get('VPS_PORT', '22'))
USER = os.environ.get('VPS_USER', 'admin')
PASSWORD = os.environ['VPS_PASSWORD']
REPO_ROOT = os.getcwd()
REMOTE_STAGING = '/home/admin/cs2-relic-hall'
REMOTE_ROOT = '/var/www/cs2-relic-hall'

UPLOAD_ITEMS = [
    'index.html',
    'catalog.html',
    'collections.html',
    'item.html',
    'favorites.html',
    'recent.html',
    'account.html',
    'inventory.html',
    'app.js',
    'app-overrides.js',
    'styles.css',
    'catalog-data.js',
    'catalog-meta.js',
    'data.js',
    'viewer-3d.js',
    'site-guard.js',
    '.data/market-prices.js',
]


def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        hostname=HOST,
        port=PORT,
        username=USER,
        password=PASSWORD,
        timeout=15,
        auth_timeout=15,
        banner_timeout=15,
        look_for_keys=False,
        allow_agent=False,
    )
    return client


def exec_checked(client, command: str):
    stdin, stdout, stderr = client.exec_command(command)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if exit_code != 0:
        raise RuntimeError(f'Command failed ({exit_code}): {command}\nSTDOUT:\n{out}\nSTDERR:\n{err}')
    return out, err


def ensure_remote_dir(sftp, remote_dir: str):
    parts = [part for part in remote_dir.split('/') if part]
    current = '/'
    for part in parts:
        current = posixpath.join(current, part)
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


def upload_all(sftp):
    ensure_remote_dir(sftp, REMOTE_STAGING)
    ensure_remote_dir(sftp, f'{REMOTE_STAGING}/.data')
    for item in UPLOAD_ITEMS:
        local_path = os.path.join(REPO_ROOT, *item.split('/'))
        remote_path = posixpath.join(REMOTE_STAGING, item)
        ensure_remote_dir(sftp, posixpath.dirname(remote_path))
        sftp.put(local_path, remote_path)
        print(f'Uploaded {item}')


def main():
    client = connect()
    try:
        out, _ = exec_checked(client, 'whoami && hostname')
        print(out.strip())

        exec_checked(client, f'mkdir -p {REMOTE_STAGING} {REMOTE_STAGING}/.data')

        sftp = client.open_sftp()
        try:
            upload_all(sftp)
        finally:
            sftp.close()

        exec_checked(client, "echo '%s' | sudo -S dnf install -y nginx || echo '%s' | sudo -S yum install -y nginx" % (PASSWORD, PASSWORD))
        exec_checked(client, "echo '%s' | sudo -S mkdir -p %s %s/.data" % (PASSWORD, REMOTE_ROOT, REMOTE_ROOT))
        exec_checked(client, "echo '%s' | sudo -S cp -rf %s/* %s/" % (PASSWORD, REMOTE_STAGING, REMOTE_ROOT))
        exec_checked(client, "echo '%s' | sudo -S cp -f %s/.data/market-prices.js %s/.data/market-prices.js" % (PASSWORD, REMOTE_STAGING, REMOTE_ROOT))

        nginx_conf = """server {
    listen 80;
    server_name _;
    root /var/www/cs2-relic-hall;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""
        remote_tmp_conf = f'{REMOTE_STAGING}/cs2-relic-hall.conf'
        nginx_sftp = client.open_sftp()
        try:
            with nginx_sftp.file(remote_tmp_conf, 'w') as remote_file:
                remote_file.write(nginx_conf)
        finally:
            nginx_sftp.close()
        exec_checked(client, "echo '%s' | sudo -S cp -f %s /etc/nginx/conf.d/cs2-relic-hall.conf" % (PASSWORD, remote_tmp_conf))
        exec_checked(client, "echo '%s' | sudo -S nginx -t" % PASSWORD)
        exec_checked(client, "echo '%s' | sudo -S systemctl enable nginx" % PASSWORD)
        exec_checked(client, "echo '%s' | sudo -S systemctl restart nginx" % PASSWORD)
        out, _ = exec_checked(client, "curl -I http://127.0.0.1/")
        print(out.strip())
    finally:
        client.close()


if __name__ == '__main__':
    main()
