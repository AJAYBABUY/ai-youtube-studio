@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title AI YouTube Studio - Local Production Engine
echo ==============================================================
echo    AI YOUTUBE STUDIO - AUTONOMOUS PRODUCTION PLATFORM
echo ==============================================================
echo.

cd /d "%~dp0"

:: Set system and user paths
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin;%LOCALAPPDATA%\Programs\Python\Python312;%PATH%"

:: Create data directories
if not exist "data\channels" mkdir "data\channels"
if not exist "data\logs" mkdir "data\logs"

:: Check if port 8000 is already active to prevent duplicate process
netstat -aon | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [Backend] Process already listening on port 8000. Skipping launch.
) else (
    echo [Backend] Starting FastAPI Backend on http://127.0.0.1:8000...
    start "AI YouTube Studio Backend" /min cmd /c "set PYTHONPATH=%~dp0backend&& venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend >> data\logs\backend.log 2>&1"
    timeout /t 3 /nobreak >nul
)

:: Check if port 5173 is already active
netstat -aon | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [Frontend] Process already listening on port 5173. Skipping launch.
) else (
    echo [Frontend] Starting React/Vite Interface on http://localhost:5173...
    start "AI YouTube Studio Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev >> ..\data\logs\frontend.log 2>&1"
    timeout /t 2 /nobreak >nul
)

echo.
echo Opening Studio Dashboard in your web browser...
start http://localhost:5173

echo.
echo ==============================================================
echo    AI YOUTUBE STUDIO IS ACTIVE!
echo.
echo    Local Dashboard: http://localhost:5173
echo    API Health:      http://127.0.0.1:8000/api/health
echo    Interactive API: http://127.0.0.1:8000/docs
echo.
echo.
echo    Authentication:  Protected by Studio Access Key (stored in data\.access_key)
echo.
echo    - Background scheduler is active.
echo    - To stop services, run Stop-Studio.bat.
echo ==============================================================
echo.
pause

