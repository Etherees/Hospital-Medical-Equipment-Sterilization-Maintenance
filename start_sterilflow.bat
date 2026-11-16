@echo off
setlocal
title STERILFLOW - Master System Launcher
color 0B

echo =====================================================================
echo         STERILFLOW 2.0 - HOSPITAL MEDICAL EQUIPMENT SYSTEM
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Check & Start Camunda 8 (port 8080)
netstat -ano | findstr ":8080 " >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [*] Camunda 8 is offline. Launching Camunda 8 Engine...
    if exist "C:\Users\ether\Downloads\camunda8-run-8.8-windows-x86_64\c8run-8.8.41\Start-Camunda-8.bat" (
        start "Camunda 8 Run" cmd /c "C:\Users\ether\Downloads\camunda8-run-8.8-windows-x86_64\c8run-8.8.41\Start-Camunda-8.bat"
        echo [*] Waiting 15 seconds for Camunda 8 (Zeebe & Operate) to initialize...
        timeout /t 15 >nul
    ) else (
        echo [!] Warning: Start-Camunda-8.bat not found in standard download path.
    )
) else (
    echo [OK] Camunda 8 Operate is already running on port 8080.
)

:: 2. Check & Start Spring Boot Backend (port 8085)
netstat -ano | findstr ":8085 " >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [*] Backend API is offline. Starting Spring Boot on port 8085...
    start "STERILFLOW Backend (8085)" cmd /c "cd /d "%~dp0backend-springboot" && java -jar target\sterilflow-backend-1.0.0.jar --server.port=8085"
    timeout /t 5 >nul
) else (
    echo [OK] Spring Boot Backend API is already running on port 8085.
)

:: 3. Check & Start React Frontend (port 5173)
netstat -ano | findstr ":5173 " >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [*] Frontend Web is offline. Starting Vite on port 5173...
    start "STERILFLOW Frontend (5173)" cmd /c "set PATH=C:\Users\ether\.local\node;%PATH% && cd /d "%~dp0frontend-react" && npm run dev -- --host 127.0.0.1 --port 5173"
    timeout /t 3 >nul
) else (
    echo [OK] React Web Application is already running on port 5173.
)

:: 4. Start Real-Time Workflow Worker Daemon
echo [*] Launching Camunda 8 Real-Time Process Worker Daemon...
start "STERILFLOW Camunda Worker" cmd /c "run_worker.bat"

:: 5. Open Web App and Operate in Browser
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
