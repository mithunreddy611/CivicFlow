@echo off
setlocal
title CivicFlow - Universal Launcher

:: Navigate to project root directory
cd /d "%~dp0"

echo ======================================================================
echo    CIVICFLOW - Smart Civic Issue Reporting and Resolution System
echo ======================================================================
echo.

:: ------------------------------------------------------------------------
:: 1. DETECT PYTHON
:: ------------------------------------------------------------------------
echo [1/4] Checking Python environment...
set "PYTHON_CMD="

python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python"
    goto :python_found
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=py"
    goto :python_found
)

for /d %%I in ("%LOCALAPPDATA%\Programs\Python\Python3*") do (
    if exist "%%I\python.exe" (
        set "PYTHON_CMD=%%I\python.exe"
        goto :python_found
    )
)

for /d %%I in ("C:\Program Files\Python3*") do (
    if exist "%%I\python.exe" (
        set "PYTHON_CMD=%%I\python.exe"
        goto :python_found
    )
)

for /d %%I in ("C:\Python3*") do (
    if exist "%%I\python.exe" (
        set "PYTHON_CMD=%%I\python.exe"
        goto :python_found
    )
)

:python_found
if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python was not found on your system!
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
echo    ^> Found Python: %PYTHON_CMD%
echo.

:: ------------------------------------------------------------------------
:: 2. DETECT NODE / NPM
:: ------------------------------------------------------------------------
echo [2/4] Checking Node.js and npm environment...
set "NPM_CMD="

cmd /c "npm --version" >nul 2>&1
if %errorlevel% equ 0 (
    set "NPM_CMD=npm"
    goto :npm_found
)

if exist "C:\Program Files\nodejs\npm.cmd" (
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
    goto :npm_found
)

if exist "%APPDATA%\npm\npm.cmd" (
    set "NPM_CMD=%APPDATA%\npm\npm.cmd"
    goto :npm_found
)

:npm_found
if "%NPM_CMD%"=="" (
    echo [ERROR] Node.js / npm was not found on your system!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo    ^> Found npm: %NPM_CMD%
echo.

:: ------------------------------------------------------------------------
:: 3. SETUP & PREPARE BACKEND
:: ------------------------------------------------------------------------
echo [3/4] Preparing Backend [FastAPI + SQLite]...
cd /d "%~dp0backend"

:: Create uploads folders
if not exist "uploads\issues" mkdir "uploads\issues"
if not exist "uploads\resolutions" mkdir "uploads\resolutions"

:: Check virtual environment
set "VENV_PYTHON=%~dp0backend\venv\Scripts\python.exe"
if exist "%VENV_PYTHON%" goto :venv_ready

echo    ^> Creating Python virtual environment...
"%PYTHON_CMD%" -m venv venv
if not exist "%VENV_PYTHON%" (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

echo    ^> Installing backend dependencies from requirements.txt...
"%VENV_PYTHON%" -m pip install --upgrade pip
"%VENV_PYTHON%" -m pip install -r requirements.txt

:venv_ready
echo    ^> Python virtual environment is ready.

:: Seed database if not present
if not exist "civicflow.db" (
    echo    ^> Initializing and seeding database...
    "%VENV_PYTHON%" -m app.seed
) else (
    echo    ^> Database civicflow.db is ready.
)
echo.

:: ------------------------------------------------------------------------
:: 4. SETUP & PREPARE FRONTEND
:: ------------------------------------------------------------------------
echo [4/4] Preparing Frontend [React + Vite]...
cd /d "%~dp0frontend"

if exist "node_modules\" goto :node_modules_ready

echo    ^> Installing frontend dependencies...
call "%NPM_CMD%" install

:node_modules_ready
echo    ^> Frontend dependencies are ready.
echo.

:: ------------------------------------------------------------------------
:: 5. LAUNCH BOTH SERVERS
:: ------------------------------------------------------------------------
echo ======================================================================
echo    STARTING CIVICFLOW SERVERS
echo ======================================================================
echo.

echo Starting Backend on http://127.0.0.1:8000 ...
start "CivicFlow Backend (Port 8000)" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend on http://localhost:5173 ...
start "CivicFlow Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

:: Open app in default web browser
start http://localhost:5173

echo.
echo ======================================================================
echo    CIVICFLOW IS RUNNING!
echo ======================================================================
echo.
echo   * Web Application:     http://localhost:5173
echo   * Backend API:         http://127.0.0.1:8000
echo   * API Documentation:   http://127.0.0.1:8000/docs
echo.
echo   -------------------------------------------------------------------
echo   Default Test Accounts:
echo   -------------------------------------------------------------------
echo   Citizen:        citizen@civicflow.com    / citizen123
echo   Field Officer:  arjun@civicflow.com      / arjun123
echo   Administrator:  admin@civicflow.com      / admin123
echo   -------------------------------------------------------------------
echo.
echo Both servers are running in their respective windows.
echo To stop CivicFlow, close those two terminal windows.
echo.
pause
