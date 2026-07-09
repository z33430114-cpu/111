$ErrorActionPreference = 'Stop'

Set-Location -LiteralPath $PSScriptRoot

$cmdArgs = @('/c', 'start-server.cmd') + $args
$process = Start-Process -FilePath 'cmd.exe' -ArgumentList $cmdArgs -WorkingDirectory $PSScriptRoot -Wait -PassThru -WindowStyle Hidden
exit $process.ExitCode
