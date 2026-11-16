@echo off
setlocal
title STERILFLOW Camunda 8 Real-Time Process Worker
color 0A

echo =====================================================================
echo           STERILFLOW 2.0 - CAMUNDA 8 LIVE PROCESS WORKER
echo =====================================================================
echo.
echo [*] Checking Python environment...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in your PATH! Please install Python.
    pause
    exit /b 1
)

echo [*] Target Camunda 8 Cluster: http://localhost:8080
echo [*] Supported Process Workflows:
echo     1. Main Sterilization Process    (sterilflow-main-process)
echo     2. Biomedical Calibration        (biomedical-engineer-calibration)
echo     3. Bio-Contamination Quarantine  (bio-contamination-quarantine)
echo.
echo [*] Starting Real-Time Daemon... (Keep this window open during your demo)
echo =====================================================================
echo.

cd /d "%~dp0"
python auto_daemon.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Worker stopped with code %ERRORLEVEL%.
    pause
)
