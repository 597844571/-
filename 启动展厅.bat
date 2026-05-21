@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set PORT=8765
set URL=http://127.0.0.1:%PORT%
set NODE_EXE=""

for /f "delims=" %%i in ('where node 2^>nul') do (
    set NODE_EXE=%%i
    goto :found_node
)

if exist "%ProgramFiles%\nodejs\node.exe" (
    set NODE_EXE=%ProgramFiles%\nodejs\node.exe
    goto :found_node
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe
    goto :found_node
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe
    goto :found_node
)

:found_node
if not "!NODE_EXE!"=="" (
    start "ShenshuServer" cmd /c ""!NODE_EXE!" offline-package\runtime\server.cjs"
    goto :wait_and_open
)

start "ShenshuServer" powershell -ExecutionPolicy Bypass -File "offline-package\runtime\server.ps1"

:wait_and_open
timeout /t 2 /nobreak >nul
start "" "%URL%"

echo ==========================================
echo  Server: %URL%
echo  Keep this window open
echo ==========================================
pause
