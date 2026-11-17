@echo off
setlocal
title STERILFLOW 2.0 - Website UI Launcher
color 0B

echo =====================================================================
echo           STERILFLOW 2.0 - FRONTEND WEB PORTAL LAUNCHER
echo =====================================================================
echo.

set "STERILFLOW_DIR=%~dp0"
cd /d "%STERILFLOW_DIR%frontend-react"

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [*] Installing frontend npm packages...
    call npm install
)

:: Check if already running on port 5173
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Website is already running on http://localhost:5173/
) else (
    echo [*] Starting Vite React server (port 5173)...
    start "STERILFLOW Frontend UI (Port 5173)" cmd /k "npm run dev"
    timeout /t 2 /nobreak >nul
)

:: Open in default browser
echo [*] Opening browser to http://localhost:5173/
start http://localhost:5173/

echo.
echo [OK] STERILFLOW Web Application is live at: http://localhost:5173/
echo.
pause
