@echo off
title UPEL SIGOA - Verificacion y Diagnostico de Base de Datos
echo =======================================================
echo   UPEL SIGOA - DIAGNOSTICO DE BASE DE DATOS
echo =======================================================
echo.
cd /d "%~dp0"
echo Ejecutando verificacion de esquema mediante Node.js...
node -e "const db = require('./db'); db.query('SELECT 1').then(() => { console.log('✅ Conexion con MySQL/MariaDB verificada exitosamente.'); process.exit(0); }).catch(e => { console.error('❌ Error de conexion:', e.message); process.exit(1); });"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ADVERTENCIA] No se pudo conectar al motor MySQL.
    echo Asegurese de que el servicio MariaDB / XAMPP este iniciado.
)
pause
