@echo off
title SAFENEX Web Server
echo ===================================================
echo [SAFENEX] Web Application Server
echo URL: http://localhost:8085/
echo ===================================================
start http://localhost:8085/
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
