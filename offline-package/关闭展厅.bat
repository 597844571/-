@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8765') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Server stopped.
timeout /t 1 /nobreak >nul
