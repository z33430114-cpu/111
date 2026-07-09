@echo off
setlocal
cd /d "%~dp0"

set "APP_URL=http://127.0.0.1:4173/"
set "HEALTH_URL=%APP_URL%__health"
set "NODE_EXE="
set "OPEN_BROWSER=1"
set "API_SMOKE_URL=%APP_URL%api/account/overview"

if /I "%~1"=="--startup" set "OPEN_BROWSER=0"
if /I "%~1"=="--no-browser" set "OPEN_BROWSER=0"

if exist "D:\node.exe" set "NODE_EXE=D:\node.exe"
if not defined NODE_EXE (
  for /f "delims=" %%N in ('where node 2^>nul') do (
    if not defined NODE_EXE set "NODE_EXE=%%N"
  )
)

if not defined NODE_EXE (
  echo Node.js was not found. Please install Node.js or add node.exe to PATH.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $r = Invoke-WebRequest -UseBasicParsing '%HEALTH_URL%' -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $r = Invoke-WebRequest -UseBasicParsing '%API_SMOKE_URL%' -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 (
    echo CS2 Skin Atlas is already running at %APP_URL%
    if "%OPEN_BROWSER%"=="1" start "" "%APP_URL%"
    exit /b 0
  )
  echo Existing service on port 4173 is missing API routes. Restarting full app server...
  for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":4173 .*LISTENING"') do (
    echo Stopping process %%P on port 4173...
    taskkill /PID %%P /F >nul 2>nul
  )
  timeout /t 1 /nobreak >nul
)

echo Starting CS2 Skin Atlas in the background...
echo Node:  %NODE_EXE%
echo Local: %APP_URL%

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -FilePath '%NODE_EXE%' -ArgumentList 'scripts/serve.mjs' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

set "READY=0"
for /L %%I in (1,1,15) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $h = Invoke-WebRequest -UseBasicParsing '%HEALTH_URL%' -TimeoutSec 2; $a = Invoke-WebRequest -UseBasicParsing '%API_SMOKE_URL%' -TimeoutSec 2; if ($h.StatusCode -ge 200 -and $a.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 (
    set "READY=1"
    goto :started
  )
  timeout /t 1 /nobreak >nul
)

:started
if "%READY%"=="1" (
  echo Server is ready.
  if "%OPEN_BROWSER%"=="1" start "" "%APP_URL%"
  exit /b 0
)

echo Server did not become ready in time.
exit /b 1
