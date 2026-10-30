@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;%PATH%"

echo ==============================================================
echo    AI YOUTUBE STUDIO - GITHUB UPLOAD
echo ==============================================================
echo.
echo Target Repository: https://github.com/AJAYBABUY/ai-youtube-studio.git
echo Branch:            main
echo.
echo Checking Git push status...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================
    echo    SUCCESS: Pushed to https://github.com/AJAYBABUY/ai-youtube-studio.git
    echo ==============================================================
) else (
    echo.
    echo [Notice] If browser authentication was not completed,
    echo run GitHub CLI authentication by typing:
    echo    gh auth login
    echo and select "GitHub.com" -> "HTTPS" -> "Login with a web browser".
)

echo.
pause

