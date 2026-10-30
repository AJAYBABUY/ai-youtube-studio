@echo off
chcp 65001 >nul
title AI YouTube Studio - Shutdown
echo ==============================================================
echo    STOPPING AI YOUTUBE STUDIO SERVICES
echo ==============================================================
echo.

echo [1/3] Terminating backend process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Terminating frontend process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Terminating Cloudflare Tunnel process...
taskkill /F /IM cloudflared.exe >nul 2>&1

echo.
echo ==============================================================
echo    All AI YouTube Studio services have been stopped cleanly.
echo ==============================================================
echo.
pause

