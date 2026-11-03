@echo off
cd /d "%~dp0"
echo.
echo === Login as usmansolarbright (browser will open) ===
"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --web --scopes repo,workflow
if errorlevel 1 goto fail

echo.
echo === Checking account ===
"C:\Program Files\GitHub CLI\gh.exe" api user -q .login
"C:\Program Files\GitHub CLI\gh.exe" auth setup-git

echo.
echo === Pushing website to usmansolarbright/solar-code ===
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/usmansolarbright/solar-code.git
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" push -u origin main
if errorlevel 1 goto fail

echo.
echo SUCCESS: https://github.com/usmansolarbright/solar-code
pause
exit /b 0

:fail
echo.
echo FAILED. Make sure you logged in as usmansolarbright.
pause
exit /b 1
