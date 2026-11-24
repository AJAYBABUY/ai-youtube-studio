@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title AI YouTube Studio - Cloudflare Tunnel Launcher
echo ==============================================================
echo    AI YOUTUBE STUDIO - CLOUDFLARE TUNNEL ACCESS
echo ==============================================================
echo.

cd /d "%~dp0"

:: Ensure logs directory exists
if not exist "data\logs" mkdir "data\logs"

:: Locate cloudflared binary
set "CLOUDFLARED_BIN="
where cloudflared >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "CLOUDFLARED_BIN=cloudflared"
) else (
    if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
        set "CLOUDFLARED_BIN=C:\Program Files (x86)\cloudflared\cloudflared.exe"
    )
)

if "%CLOUDFLARED_BIN%"=="" (
    echo [ERROR] cloudflared.exe was not found.
    echo Please install Cloudflare Tunnel using:
    echo   winget install Cloudflare.cloudflared
    echo.
    pause
    exit /b 1
)

:: Check if cloudflared is already running to prevent duplicate tunnels
tasklist /fi "imagename eq cloudflared.exe" | findstr /i "cloudflared.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Cloudflare Tunnel is already active and running in the background.
    echo Tunnel logs are available in data\logs\tunnel.log
    goto :show_summary
)

:: Check if backend on port 8000 is running
netstat -aon | findstr :8000 | findstr LISTENING >nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] FastAPI backend is not yet running on port 8000!
    echo Starting backend first...
    start /b cmd /c "Start-Studio.bat"
    timeout /t 3 /nobreak >nul
)

echo Starting Cloudflare Tunnel for FastAPI backend (http://127.0.0.1:8000)...

:: Check for tunnel token in .env or run tunnel
findstr /i "CLOUDFLARE_TUNNEL_TOKEN=" .env >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=2 delims==" %%a in ('findstr /i "CLOUDFLARE_TUNNEL_TOKEN=" .env') do set "TOKEN=%%a"
    if not "!TOKEN!"=="" (
        echo Running configured named tunnel via token...
        start "Cloudflare Tunnel - ai-youtube-studio" /min "%CLOUDFLARED_BIN%" tunnel run --token !TOKEN! >> data\logs\tunnel.log 2>&1
        goto :launched
    )
)

:: Check if origin cert exists for named tunnel
if exist "%USERPROFILE%\.cloudflared\cert.pem" (
    echo Running named tunnel 'ai-youtube-studio'...
    start "Cloudflare Tunnel - ai-youtube-studio" /min "%CLOUDFLARED_BIN%" tunnel run ai-youtube-studio >> data\logs\tunnel.log 2>&1
    goto :launched
)

:: Fallback to Quick Tunnel
echo Running Cloudflare Quick Tunnel for port 8000...
start "Cloudflare Tunnel - Quick Tunnel" /min "%CLOUDFLARED_BIN%" tunnel --url http://127.0.0.1:8000 >> data\logs\tunnel.log 2>&1

:launched
echo Waiting for Cloudflare Tunnel to assign public URL...
set "TUNNEL_URL="
for /l %%i in (1,1,8) do (
    if "!TUNNEL_URL!"=="" (
        timeout /t 1 /nobreak >nul
        for /f "tokens=*" %%u in ('powershell -Command "if (Test-Path 'data\logs\tunnel.log') { (Get-Content 'data\logs\tunnel.log' | Select-String -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | ForEach-Object { \$_.Matches[0].Value } | Select-Object -Last 1) }"') do (
            set "TUNNEL_URL=%%u"
        )
    )
)

:show_summary
echo.
echo ==============================================================
echo    CLOUDFLARE TUNNEL IS RUNNING!
echo.
if not "!TUNNEL_URL!"=="" (
    echo    Active Public Tunnel: !TUNNEL_URL!
    echo.
    echo    DIRECT AUTO-CONNECT URL:
    echo    https://ai-youtube-studio-ajay.netlify.app/?tunnel=!TUNNEL_URL!
    echo.
    echo    Opening Live Studio in browser...
    start "" "https://ai-youtube-studio-ajay.netlify.app/?tunnel=!TUNNEL_URL!"
) else (
    echo    Target Frontend: https://ai-youtube-studio-ajay.netlify.app
    echo    Local Backend:   http://127.0.0.1:8000
    echo    Tunnel Log:      data\logs\tunnel.log
    echo.
    echo    Inspect active URL with:
    echo      findstr /i "trycloudflare.com" data\logs\tunnel.log
)
echo.
echo    To stop the tunnel, run Stop-Studio.bat.
echo ==============================================================
echo.
pause

