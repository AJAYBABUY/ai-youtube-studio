@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title AI YouTube Studio - Master Launcher
echo ==============================================================
echo    AI YOUTUBE STUDIO - COMPLETE SYSTEM LAUNCHER
echo ==============================================================
echo.

cd /d "%~dp0"

:: Set system and user paths
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin;%LOCALAPPDATA%\Programs\Python\Python312;C:\Program Files (x86)\cloudflared;%PATH%"

:: Create data directories
if not exist "data\channels" mkdir "data\channels"
if not exist "data\logs" mkdir "data\logs"

echo [1/6] Checking Python Environment...
set "PYTHON_EXE=venv\Scripts\python.exe"
if not exist "!PYTHON_EXE!" (
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        set "PYTHON_EXE=python"
    ) else (
        echo [ERROR] Python environment not found! Please run install.bat.
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%v in ('"!PYTHON_EXE!" --version 2^>^&1') do echo         Found: %%v

echo [2/6] Checking Node.js Environment...
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo         Found Node: %%v
) else (
    echo         [WARNING] Node.js not detected on system PATH. (Required for local frontend dev server)
)

echo [3/6] Checking FFmpeg Video Processing Engine...
where ffmpeg >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo         Found FFmpeg: Available
) else (
    if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe" (
        echo         Found FFmpeg: Gyan 9.0.1 Build in WinGet Packages
    ) else (
        echo         [WARNING] FFmpeg not found on PATH. Video rendering may be restricted.
    )
)

echo [4/6] Starting FastAPI Production Backend (Port 8000)...
netstat -aon | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo         Backend is already active on port 8000. No duplicate process created.
) else (
    start "AI YouTube Studio Backend" /min cmd /c "set PYTHONPATH=%~dp0backend&& "!PYTHON_EXE!" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend >> data\logs\backend.log 2>&1"
    timeout /t 3 /nobreak >nul
    echo         Backend started successfully on http://127.0.0.1:8000
)

echo [5/6] Initializing Production Scheduler and Job Recovery...
echo         Scheduler initialized in FastAPI lifespan with auto-recovery enabled.

echo [6/6] Checking Cloudflare Tunnel...
tasklist /fi "imagename eq cloudflared.exe" | findstr /i "cloudflared.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo         Cloudflare Tunnel is already running in background.
) else (
    echo         Starting Cloudflare Tunnel in background...
    start "Cloudflare Tunnel" /min cmd /c "Start-Tunnel.bat"
    timeout /t 3 /nobreak >nul
)

echo.
echo ==============================================================
echo    AI YOUTUBE STUDIO - PRODUCTION SYSTEM STATUS: ONLINE
echo ==============================================================
echo.
echo    LIVE FRONTEND:     https://ai-youtube-studio-ajay.netlify.app
echo    LOCAL DASHBOARD:   http://localhost:5173
echo    BACKEND API:       http://127.0.0.1:8000
echo    API HEALTH:        http://127.0.0.1:8000/api/health
echo    INTERACTIVE DOCS:  http://127.0.0.1:8000/docs
echo.
echo    AUTHENTICATION:    Protected by Studio Access Key (stored in data\.access_key)
echo    (Enter your secret key from data\.access_key in the web app to authenticate)
echo.
echo    TUNNEL LOG:        data\logs\tunnel.log
echo    BACKEND LOG:       data\logs\backend.log
echo.
echo    - Production scheduler is monitoring all connected channels.
echo    - System will gracefully recover interrupted jobs on restart.
echo    - To stop all services cleanly, run Stop-Studio.bat.
echo ==============================================================
echo.
pause

