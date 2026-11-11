@echo off
setlocal
cd /d "%~dp0"

set "PEM_KEY=%USERPROFILE%\Desktop\upel-key.pem"
if not exist "%PEM_KEY%" set "PEM_KEY=%USERPROFILE%\Downloads\upel-key.pem"
set "SERVER_HOST=ubuntu@3.133.148.107"
set "APP_DIR=/var/www/upel-sigoa"
set "LOCAL_BACKUP_DIR=%~dp0backups_aws"

echo ==========================================================
echo   UPEL SIGOA - RESPALDO EXTERNO DESDE AWS (%SERVER_HOST%)
echo ==========================================================

if not exist "%PEM_KEY%" (
  echo [ERROR] No se encontro upel-key.pem en Desktop ni Downloads.
  pause
  exit /b 1
)

if not exist "%LOCAL_BACKUP_DIR%" mkdir "%LOCAL_BACKUP_DIR%"

for /f "delims=" %%f in ('ssh -i "%PEM_KEY%" -o StrictHostKeyChecking=accept-new "%SERVER_HOST%" "set -e; set -a; source %APP_DIR%/server/.env; set +a; STAMP=$(date +%%Y-%%m-%%d_%%H-%%M-%%S); OUT=%APP_DIR%/server/uploads/backups/manual_ext_${STAMP}.sql; MYSQL_PWD=\"${DB_PASSWORD:-}\" mysqldump -h \"${DB_HOST:-127.0.0.1}\" -P \"${DB_PORT:-3306}\" -u \"$DB_USER\" --single-transaction --no-tablespaces --routines --triggers \"$DB_NAME\" > \"$OUT\"; echo \"$OUT\""') do set "REMOTE_DUMP=%%f"

if not defined REMOTE_DUMP (
  echo [ERROR] No se pudo generar el respaldo remoto en AWS.
  pause
  exit /b 1
)

scp -i "%PEM_KEY%" -o BatchMode=yes "%SERVER_HOST%:%REMOTE_DUMP%" "%LOCAL_BACKUP_DIR%\"
if errorlevel 1 (
  echo [ERROR] Fallo la descarga por SCP hacia %LOCAL_BACKUP_DIR%.
  pause
  exit /b 1
)

ssh -i "%PEM_KEY%" -o BatchMode=yes "%SERVER_HOST%" "ls -1t %APP_DIR%/server/uploads/backups/manual_ext_*.sql 2>/dev/null | tail -n +6 | xargs -r rm -f" >nul 2>&1

echo.
echo [OK] Respaldo externo descargado en: %LOCAL_BACKUP_DIR%
dir /b /o-d "%LOCAL_BACKUP_DIR%\*.sql"
pause
