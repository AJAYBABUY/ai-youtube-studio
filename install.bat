@echo off
chcp 65001 >nul
echo ==============================================================
echo    AI YOUTUBE STUDIO - WINDOWS AUTOMATIC INSTALLER
echo ==============================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
echo [1/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python was not found in PATH!
    echo Attempting to locate Python 3.12...
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    ) else (
        echo ERROR: Please install Python 3.12 from python.org or via winget:
        echo winget install Python.Python.3.12
        pause
        exit /b 1
    )
) else (
    set "PYTHON_EXE=python"
)

:: 2. Check Node.js
echo [2/5] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not detected in PATH.
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else (
        echo ERROR: Please install Node.js LTS from nodejs.org or via winget:
        echo winget install OpenJS.NodeJS.LTS
        pause
        exit /b 1
    )
)

:: 3. Setup Virtual Environment & Backend Dependencies
echo [3/5] Setting up Python virtual environment...
if not exist "venv" (
    "%PYTHON_EXE%" -m venv venv
)
echo Installing backend Python packages...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt

:: 4. Setup Frontend Dependencies & Build
echo [4/5] Installing frontend packages & building web client...
cd frontend
call npm install
call npm run build
cd ..

:: 5. Setup Environment File
echo [5/5] Initializing configuration...
if not exist ".env" (
    copy .env.example .env >nul
    echo Created .env from template.
)

echo.
echo ==============================================================
echo    INSTALLATION COMPLETE!
echo    You can now run Start.bat to launch AI YouTube Studio.
echo ==============================================================
pause

