import paramiko

host = '8.222.129.216'
username = 'admin'
password = 'L20050910zh'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname=host, username=username, password=password, timeout=10, auth_timeout=10, banner_timeout=10, look_for_keys=False, allow_agent=False)
    stdin, stdout, stderr = client.exec_command('whoami && hostname')
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))
finally:
    client.close()
