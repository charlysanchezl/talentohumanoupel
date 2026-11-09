@echo off
title UPEL SIGOA - Modo Desarrollo (Hot-Reload)
echo Iniciando en modo desarrollador con Vite...
cd /d "%~dp0"
start "Servidor Backend UPEL" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul
start "Interfaz Web UPEL" cmd /k "npm run dev -- --open"
