@echo off
REM Event Booking System - Quick Start Script for Windows

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║    Event Booking System - Quick Start                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the server in a new window
echo Starting server...
start "Event Booking System Server" cmd /k npm start

REM Wait for server to start
timeout /t 3 /nobreak

echo.
echo ✓ Server started in a new window
echo.
echo To run the demo, open another terminal and run:
echo   node demo.js
echo.
echo To view the README:
echo   start README.md
echo.
echo API Documentation:
echo   http://localhost:3000/api/health
echo.
pause
