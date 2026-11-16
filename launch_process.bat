@echo off
setlocal
title STERILFLOW 2.0 - Live Workflow Demo Launcher
color 0E

cd /d "%~dp0"

echo =====================================================================
echo         STERILFLOW 2.0 - CAMUNDA 8 LIVE PROCESS LAUNCHER
echo =====================================================================
echo.
echo [*] Checking Python environment...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in your PATH! Please install Python.
    pause
    exit /b 1
)

:: Check if Camunda 8 is reachable on port 8080
echo [*] Verifying connection to Camunda 8 (port 8080)...
python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/operate', timeout=2)" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Warning: Camunda 8 Operate is not responding yet on port 8080.
    echo [*] If Camunda is starting up, please wait a moment or run start_sterilflow.bat first.
    echo.
)

python interactive_launcher.py

pause
