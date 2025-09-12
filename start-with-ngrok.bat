@echo off
echo Starting Next.js app with ngrok...

REM Start Next.js development server
start "Next.js App" cmd /k "npm run dev"

REM Wait a moment for the app to start
timeout /t 5 /nobreak > nul

REM Start ngrok tunnel
echo Starting ngrok tunnel...
ngrok http 3000

pause
