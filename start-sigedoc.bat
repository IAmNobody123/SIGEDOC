@echo off
REM Inicia el backend y el frontend en ventanas separadas.
cd /d "%~dp0\server"
start "SIGEDOC Server" cmd /k "npm install && npm run dev"
timeout /t 2 /nobreak >nul
cd /d "%~dp0\client"
start "SIGEDOC Client" cmd /k "npm install && npm run dev -- --host 0.0.0.0"
exit
