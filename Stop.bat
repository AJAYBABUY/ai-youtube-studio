@echo off
chcp 65001 >nul
echo ==============================================================
echo    STOPPING AI YOUTUBE STUDIO
echo ==============================================================
echo.

echo Terminating backend process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Terminating frontend process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All AI YouTube Studio services have been stopped.
echo ==============================================================
pause

