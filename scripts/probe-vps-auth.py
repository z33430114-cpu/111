import paramiko

HOST = '8.222.129.216'
USER = 'admin'
PASSWORD = 'L20050910zh'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    try:
        client.connect(
            hostname=HOST,
            username=USER,
            password=PASSWORD,
            timeout=10,
            auth_timeout=10,
            banner_timeout=10,
            look_for_keys=False,
            allow_agent=False,
        )
        print('password auth ok')
        stdin, stdout, stderr = client.exec_command('whoami && hostname')
        print(stdout.read().decode('utf-8', errors='ignore'))
        print(stderr.read().decode('utf-8', errors='ignore'))
    except Exception as error:
        print(f'password auth failed: {error!r}')
        transport = paramiko.Transport((HOST, 22))
        transport.start_client(timeout=10)

        def handler(title, instructions, prompts):
            return [PASSWORD for _prompt, _echo in prompts]

        transport.auth_interactive(USER, handler)
        print('keyboard-interactive authenticated:', transport.is_authenticated())
        if transport.is_authenticated():
            channel = transport.open_session()
            channel.exec_command('whoami && hostname')
            print(channel.makefile('r').read())
            print(channel.makefile_stderr('r').read())
        transport.close()
finally:
    client.close()
