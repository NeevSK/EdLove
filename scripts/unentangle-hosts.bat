@echo off
:: Batch helper to unentangle explore.gurudevi.app from local hosts file
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dp0unentangle-hosts.bat' -Verb RunAs"
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0unentangle-hosts.ps1"
pause
