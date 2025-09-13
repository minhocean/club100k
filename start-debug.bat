@echo off
echo Starting GeminiSport with debug logging...
echo.

REM Set debug environment variables
set DEBUG=*
set NODE_ENV=development

REM Start the application
echo Starting Next.js development server...
npm run dev

pause

