@echo off
title SafeNex Dev Server
echo ===================================================
echo [SafeNex] Starting Vite React Development Server...
echo URL: http://localhost:5173/
echo ===================================================
start http://localhost:5173/
call npm run dev
pause
