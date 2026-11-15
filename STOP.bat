@echo off
title STERILFLOW - Shutdown Manager
color 0C
cls
echo ===============================================================================
echo             STERILFLOW : Terminating Platform Services
echo ===============================================================================
echo.

echo [*] Stopping services listening on port 8080 (Spring Boot Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo [*] Stopping services listening on port 5173 (React Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo [+] All STERILFLOW backend and frontend processes have been stopped cleanly.
echo.
pause
