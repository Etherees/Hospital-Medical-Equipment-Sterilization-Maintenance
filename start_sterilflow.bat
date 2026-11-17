@echo off
setlocal enabledelayedexpansion
title STERILFLOW 2.0 - Complete System Launcher
color 0A

echo =====================================================================
echo    STERILFLOW 2.0 - Hospital CSSD Sterilization Platform Launcher
echo =====================================================================
echo.

set "STERILFLOW_DIR=%~dp0"
set "CAMUNDA_BAT=C:\Users\ether\Downloads\camunda8-run-8.8-windows-x86_64\c8run-8.8.41\Start-Camunda-8.bat"
set "JAVA21_HOME=C:\Users\ether\.local\jdk-21\jdk-21.0.12.1+1"

:: 1. Ensure Java 21 is configured
if exist "%JAVA21_HOME%\bin\java.exe" (
    set "JAVA_HOME=%JAVA21_HOME%"
    set "PATH=%JAVA21_HOME%\bin;%PATH%"
    echo [OK] Using Java 21 from: %JAVA21_HOME%
) else (
    echo [!] Using system Java from PATH.
)

:: 2. Check & Start Camunda 8 (Port 8080)
echo.
echo [*] Checking Camunda 8 Zeebe cluster (Port 8080)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Camunda 8 is already running on port 8080.
) else (
    echo [*] Starting Camunda 8 Engine...
    if exist "%CAMUNDA_BAT%" (
        start "Camunda 8 Engine (c8run)" cmd /c "%CAMUNDA_BAT%"
        echo [OK] Camunda 8 startup triggered. Waiting 5 seconds...
        timeout /t 5 /nobreak >nul
    ) else (
        echo [!] Warning: Camunda startup batch file not found at %CAMUNDA_BAT%
    )
)

:: 3. Check & Start Spring Boot Backend (Port 8085)
echo.
echo [*] Checking Spring Boot Backend (Port 8085)...
netstat -ano | findstr ":8085" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Spring Boot Backend is already running on port 8085.
) else (
    echo [*] Launching Spring Boot Backend...
    cd /d "%STERILFLOW_DIR%backend-springboot"
    if exist "target\sterilflow-backend-1.0.0.jar" (
        start "STERILFLOW Backend (Port 8085)" cmd /k "set JAVA_HOME=%JAVA21_HOME%&& set PATH=%JAVA21_HOME%\bin;%%PATH%%&& java -jar target\sterilflow-backend-1.0.0.jar --server.port=8085"
    ) else (
        start "STERILFLOW Backend (Port 8085)" cmd /k "set JAVA_HOME=%JAVA21_HOME%&& set PATH=%JAVA21_HOME%\bin;%%PATH%%&& mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8085"
    )
    echo [OK] Spring Boot Backend launched.
    timeout /t 3 /nobreak >nul
)

:: 4. Check & Start Vite React Frontend (Port 5173)
echo.
echo [*] Checking Vite React Frontend (Port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Frontend is already running on port 5173.
) else (
    echo [*] Launching Frontend UI (npm run dev)...
    cd /d "%STERILFLOW_DIR%frontend-react"
    start "STERILFLOW Frontend (Port 5173)" cmd /k "npm run dev"
    echo [OK] Frontend server launched.
    timeout /t 2 /nobreak >nul
)

:: 5. Open Web Browser
echo.
echo [*] Opening STERILFLOW Portal in default browser...
start http://localhost:5173/

echo.
echo =====================================================================
echo                       SYSTEM STATUS: ONLINE
echo =====================================================================
echo  - Web Application:       http://localhost:5173/
echo  - Camunda 8 Operate:     http://localhost:8080/operate
echo  - Camunda 8 Tasklist:    http://localhost:8080/tasklist
echo  - Spring Boot API:       http://localhost:8085/api/
echo  - H2 Database Console:   http://localhost:8085/h2-console
echo =====================================================================
echo.
echo Press any key to exit this launcher window (services will remain running)...
pause >nul
