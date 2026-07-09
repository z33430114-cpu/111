@echo off
setlocal

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":4173 .*LISTENING"') do (
  echo Stopping process %%P on port 4173...
  taskkill /PID %%P /F >nul 2>nul
)

echo Done.
exit /b 0
