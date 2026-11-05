@echo off
title ContextOS Frontend Dashboard
cd /d "%~dp0\..\frontend"
echo [ContextOS] Starting React Frontend on http://127.0.0.1:5173 ...
npm run dev
pause

