@echo off
title STERILFLOW - Medical Sterilization & Maintenance Platform
color 0A
cls
echo ===============================================================================
echo      STERILFLOW : Hospital Medical Equipment Sterilization & Maintenance
echo                  Inspired by Siemens Healthineers Platform
echo ===============================================================================
echo.
echo [*] Checking environment dependencies...

:: Ensure node and npm paths are available
set "PATH=C:\Users\ether\.local\node;%PATH%"

:: Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Java is not found in PATH. Please install Java 21 LTS.
    pause
    exit /b 1
)

:: Check Node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not found in PATH.
    pause
    exit /b 1
)

echo [+] Environment verified: Java and Node.js detected.
echo.

cd /d "%~dp0"

:: Check if backend JAR exists, if not build it
if not exist "backend-springboot\target\sterilflow-backend-1.0.0.jar" (
    echo [*] Backend JAR not found. Compiling with Maven...
    cd backend-springboot
    call mvn clean package -DskipTests
    cd ..
)

:: Check frontend dependencies
if not exist "frontend-react\node_modules" (
    echo [*] Installing frontend npm dependencies...
    cd frontend-react
    call npm install
    cd ..
)

echo [*] Launching Spring Boot Backend on http://localhost:8080 ...
start "STERILFLOW Backend [Port 8080]" cmd /k "cd /d %~dp0backend-springboot && java -jar target\sterilflow-backend-1.0.0.jar"

echo [*] Launching React Vite Frontend on http://localhost:5173 ...
start "STERILFLOW Frontend [Port 5173]" cmd /k "set PATH=C:\Users\ether\.local\node;%%PATH%% && cd /d %~dp0frontend-react && npm run dev"

echo.
echo [*] Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak >nul

echo [*] Opening STERILFLOW Web Application in default browser...
start http://localhost:5173/

echo.
echo ===============================================================================
echo [+] STERILFLOW services successfully initialized!
echo     - Web Portal:   http://localhost:5173
echo     - REST Backend: http://localhost:8080
echo     - H2 Database:  http://localhost:8080/h2-console
echo ===============================================================================
echo.
echo Press any key to exit this launcher window (services will continue running).
pause >nul
