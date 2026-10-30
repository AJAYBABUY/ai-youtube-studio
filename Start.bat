@echo off
chcp 65001 >nul
title AI YouTube Studio - Launch Console
echo ==============================================================
echo    AI YOUTUBE STUDIO - AUTONOMOUS PRODUCTION PLATFORM
echo ==============================================================
echo.

cd /d "%~dp0"

:: Set system and user paths
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin;%LOCALAPPDATA%\Programs\Python\Python312;%PATH%"

:: Check venv
if not exist "venv\Scripts\python.exe" (
    echo Python virtual environment not found. Running installer first...
    call install.bat
)

:: Create data directories
if not exist "data\channels" mkdir "data\channels"
if not exist "data\logs" mkdir "data\logs"

echo [1/3] Starting AI YouTube Studio Backend API (Port 8000)...
start "AI YouTube Studio Backend" /min cmd /c "set PYTHONPATH=%~dp0backend&& venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend >> data\logs\backend.log 2>&1"

:: Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

echo [2/3] Starting AI YouTube Studio Frontend Interface (Port 5173)...
start "AI YouTube Studio Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev >> ..\data\logs\frontend.log 2>&1"

:: Wait 2 seconds for Vite to bind
timeout /t 2 /nobreak >nul

echo [3/3] Opening Studio Dashboard in your web browser...
start http://localhost:5173

echo.
echo ==============================================================
echo    AI YOUTUBE STUDIO IS RUNNING!
echo.
echo    Dashboard:   http://localhost:5173
echo    Backend API: http://127.0.0.1:8000/docs
echo.
echo    - Background scheduler is actively monitoring your channels.
echo    - To stop all services gracefully, run Stop.bat.
echo ==============================================================
echo.
echo Press any key to minimize this window or run Stop.bat to exit...
pause >nul

