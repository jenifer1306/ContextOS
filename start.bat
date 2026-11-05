@echo off
setlocal enabledelayedexpansion
title ContextOS Launcher (Windows)
color 0B

echo ===============================================================================
echo      ContextOS: Privacy-Preserving Context-Aware Computing System
echo             Using On-Device Small Language Models (SLMs)
echo ===============================================================================
echo.

:: 1. Verify Python
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Python is not installed or not in system PATH!
    echo Please install Python 3.10+ from https://python.org and ensure "Add Python to PATH" is checked.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo [OK] Detected %%v

:: 2. Verify Node.js
echo.
echo [2/6] Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js is not installed or not in system PATH!
    echo Please install Node.js 18+ from https://nodejs.org and restart this launcher.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Detected Node.js %%v

:: 3. Verify and install backend dependencies
echo.
echo [3/6] Verifying backend Python dependencies...
python -c "import fastapi, uvicorn, pydantic, reportlab, psutil" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Missing backend Python dependencies. Installing from requirements.txt...
    python -m pip install -r "%~dp0backend\requirements.txt"
    if errorlevel 1 (
        color 0C
        echo.
        echo [ERROR] Failed to install backend dependencies!
        echo Please ensure you have internet access or check your pip configuration.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed successfully.
) else (
    echo [OK] All backend Python dependencies are present.
)

:: 4. Verify and install frontend dependencies
echo.
echo [4/6] Verifying frontend npm dependencies...
if not exist "%~dp0frontend\node_modules\" (
    echo [INFO] Missing frontend node_modules. Installing npm packages...
    pushd "%~dp0frontend"
    call npm install
    if errorlevel 1 (
        popd
        color 0C
        echo.
        echo [ERROR] Failed to install frontend npm packages!
        echo Please verify Node.js and npm connectivity.
        echo.
        pause
        exit /b 1
    )
    popd
    echo [OK] Frontend packages installed successfully.
) else (
    echo [OK] Frontend node_modules directory is present.
)

:: 5. Initialize Database & Verify 6-Page Research Paper PDF
echo.
echo [5/6] Initializing SQLite database and verifying research paper...
pushd "%~dp0backend"
python -c "import database; database.init_db(); print('[OK] SQLite WAL Database initialized successfully.')"
if errorlevel 1 (
    popd
    color 0C
    echo.
    echo [ERROR] Database initialization failed!
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0ContextOS_Research_Paper.pdf" (
    echo Compiling 6-Page IEEE Research Paper PDF...
    python paper_generator.py
)
popd

if exist "%~dp0ContextOS_Research_Paper.pdf" (
    echo [OK] 6-Page Research Paper PDF verified at ContextOS_Research_Paper.pdf
)

:: 6. Launch Backend and Frontend in separate windows
echo.
echo [6/6] Launching ContextOS services in separate command windows...

pushd "%~dp0backend"
start "ContextOS Backend (FastAPI)" cmd.exe /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000"
popd

:: Wait 2 seconds for backend to bind port
timeout /t 2 /nobreak >nul

pushd "%~dp0frontend"
start "ContextOS Frontend (Vite)" cmd.exe /k "npm run dev"
popd

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul

echo.
echo ===============================================================================
echo   ContextOS is now running!
echo.
echo   Frontend Dashboard:  http://127.0.0.1:5173
echo   Backend REST API:    http://127.0.0.1:8000
echo   API Swagger Docs:    http://127.0.0.1:8000/docs
echo   Research Paper PDF:  %~dp0ContextOS_Research_Paper.pdf
echo.
echo   NOTE ON LOCAL SLM / OLLAMA:
echo   - If Ollama is active with 'qwen2.5:1.5b', neural SLM inference is used.
echo   - If Ollama is offline, the deterministic local rule-based fallback is used.
echo ===============================================================================
echo.
echo Opening default web browser...
start http://127.0.0.1:5173

pause
