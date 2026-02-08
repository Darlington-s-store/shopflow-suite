@echo off
REM ShopFlow Backend - Install and Setup Script
REM This script installs dependencies and runs the backend

cd /d "%~dp0backend"

echo.
echo ===================================
echo ShopFlow Backend Setup
echo ===================================
echo.

REM Check if package-lock.json exists and remove it
if exist package-lock.json (
    echo Removing old package-lock.json...
    del package-lock.json
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed
    echo Trying with --legacy-peer-deps flag...
    call npm install --legacy-peer-deps
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed. Please check:
    echo 1. Node.js and npm are installed
    echo 2. You have internet connection
    echo 3. Check npm logs in %APPDATA%\npm-cache\_logs
    pause
    exit /b 1
)

echo.
echo ===================================
echo Installation Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Edit .env with your database URL
echo 3. Run: npm run dev
echo.
pause
