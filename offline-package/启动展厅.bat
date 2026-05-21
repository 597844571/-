@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set PORT=8765
set URL=http://127.0.0.1:%PORT%
set NODE_EXE=""

:: 优先使用零依赖的静态服务器 exe（适合普通办公电脑）
if exist "runtime\展厅服务.exe" (
    echo [1/3] 正在启动神枢数字展厅服务...
    start "ShenshuServer" "runtime\展厅服务.exe"
    goto :wait_and_open
)

:: 其次查找 Node.js
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
    echo [2/3] 使用 Node.js 启动服务...
    start "ShenshuServer" cmd /c ""!NODE_EXE!" runtime\server.cjs"
    goto :wait_and_open
)

:: 最后的 fallback：PowerShell（可能需要管理员权限）
echo [3/3] 使用 PowerShell 启动服务...
start "ShenshuServer" powershell -ExecutionPolicy Bypass -File "runtime\server.ps1"

goto :wait_and_open

:wait_and_open
timeout /t 2 /nobreak >nul
start "" "%URL%"

echo ==========================================
echo  神枢数字展厅已启动
echo  访问地址: %URL%
echo  请勿关闭此窗口，关闭后服务将停止
echo ==========================================
pause
