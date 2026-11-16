@echo off
setlocal
title STERILFLOW - Full Stack System Launcher
color 0B

echo =====================================================================
echo         STERILFLOW 2.0 - HOSPITAL MEDICAL EQUIPMENT SYSTEM
echo =====================================================================
echo.
echo [*] Checking required ports...
echo     - Camunda 8 Operate / Zeebe: http://localhost:8080/operate
echo     - Spring Boot Backend API:   http://localhost:8085
echo     - React Web Application:     http://localhost:5173
echo.

cd /d "%~dp0"

echo [*] Launching Camunda 8 Real-Time Process Worker...
start "STERILFLOW Camunda Worker" cmd /c "run_worker.bat"

echo.
echo [*] Opening Web Application and Camunda Operate in browser...
timeout /t 2 >nul
start http://localhost:5173
start http://localhost:8080/operate

echo.
echo =====================================================================
echo [*] All STERILFLOW services and worker are active!
echo [*] You can now test any workflow in Camunda Modeler or the Web App.
echo =====================================================================
echo.
pause
