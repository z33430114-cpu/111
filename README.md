# git1

Local site launcher:

- PowerShell: `./start-server.ps1`
- Command Prompt: `start-server.cmd`
- Direct Node: `node scripts/serve.mjs`

If `npm start` fails in PowerShell with an execution policy error for `npm.ps1`, use `./start-server.ps1` or `cmd /c npm.cmd start` instead.

The Windows launchers start the site in a hidden background process and wait until `http://127.0.0.1:4173/__health` is ready.
