@echo off
title Push Safenex to GitHub
echo ===================================================
echo 🚀 Pushing SafeNex to GitHub...
echo Repository: https://github.com/bala-subramanian-A/SafeNex.git
echo ===================================================
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
git push -u origin main
echo ===================================================
pause
