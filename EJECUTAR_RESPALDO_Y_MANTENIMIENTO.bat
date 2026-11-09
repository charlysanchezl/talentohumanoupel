@echo off
title UPEL SIGOA - Respaldo y Mantenimiento de Base de Datos
chcp 65001 > nul
cls
echo =======================================================================
echo     UPEL SIGOA - SISTEMA INTEGRADO DE TALENTO HUMANO
echo        SUBDIRECCIÓN DE DOCENCIA - INSTITUTO GERVASIO RUBIO
echo =======================================================================
echo.
echo Ejecutando respaldo automático y optimización de base de datos...
echo.

cd /d "%~dp0"
node server/scripts/backup_automatizado.js

echo.
echo =======================================================================
echo  Presiona cualquier tecla para cerrar esta ventana.
echo =======================================================================
pause > nul
