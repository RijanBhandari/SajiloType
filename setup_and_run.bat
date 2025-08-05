@echo off
echo Setting up and running the application...

echo.
echo --- Installing Node.js dependencies ---
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed. Please ensure Node.js and npm are installed.
    pause
    exit /b %errorlevel%
)

echo.
echo --- Building web assets ---
call npm run build
if %errorlevel% neq 0 (
    echo Error: npm run build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo --- Syncing Capacitor assets to Android ---
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: npx cap sync android failed.
    pause
    exit /b %errorlevel%
)

echo.
echo --- Installing Python dependencies (Flask, PyAutoGUI) ---
call pip install Flask pyautogui
if %errorlevel% neq 0 (
    echo Error: pip install failed. Please ensure Python and pip are installed.
    echo You might need to run this command as administrator if you encounter permission issues.
    pause
    exit /b %errorlevel%
)

echo.
echo --- Detecting local IP address ---
set "IP_ADDRESS="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4 Address"') do (
    set "IP_ADDRESS=%%a"
    goto :found_ip
)
:found_ip
set "IP_ADDRESS=%IP_ADDRESS: =%"

if "%IP_ADDRESS%"=="" (
    echo Error: Could not detect local IPv4 address. Please ensure you have an active network connection.
    pause
    exit /b 1
)

echo Detected IP Address: %IP_ADDRESS%

echo.
echo --- Updating BatchMode.tsx with detected IP ---
set "FILE_PATH=G:\script-to-doc-flow-main\script-to-doc-flow-main\src\pages\BatchMode.tsx"
set "OLD_STRING=http://YOUR_LAPTOP_IP:5000/type"
set "NEW_STRING=http://%IP_ADDRESS%:5000/type"

REM Read the file content
for /f "usebackq delims=" %%i in ("%FILE_PATH%") do (
    set "LINE=%%i"
    setlocal enabledelayedexpansion
    set "LINE=!LINE:%OLD_STRING%=%NEW_STRING%!"
    echo !LINE!>> "%FILE_PATH%.tmp"
    endlocal
)
move /y "%FILE_PATH%.tmp" "%FILE_PATH%"

if %errorlevel% neq 0 (
    echo Error: Failed to update BatchMode.tsx. Manual update might be required.
    pause
    exit /b %errorlevel%
)

echo BatchMode.tsx updated successfully.

echo.
echo --- Starting Python server (in a new window) ---
start python server.py
echo Python server started. Keep the new window open.

echo.
echo --- Setup and initial run complete! ---
echo You can now build and run the Android app from Android Studio.
echo Or, access the web app from your phone's browser at http://%IP_ADDRESS%:5000
echo Press any key to exit this script.
pause > nul