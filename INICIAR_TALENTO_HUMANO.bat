@echo off
echo =======================================================
echo    Iniciando el Sistema de Talento Humano UPEL
echo =======================================================
echo.
echo Por favor, espera unos segundos. Tu navegador se abrira automaticamente.
echo NO cierres esta ventana negra mientras estes usando el sistema.
echo.
cd /d "%~dp0"
echo Iniciando Servidor Backend (Base de Datos)...
start "Servidor Backend UPEL" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul
echo Iniciando Interfaz Visual...
start "Interfaz Web UPEL" cmd /k "npm run dev -- --open"
