@echo off
setlocal
cd /d "%~dp0"

set "PEM_KEY=%USERPROFILE%\Desktop\upel-key.pem"
if not exist "%PEM_KEY%" set "PEM_KEY=%USERPROFILE%\Downloads\upel-key.pem"
set "SERVER_HOST=ubuntu@3.133.148.107"
set "APP_DIR=/var/www/upel-sigoa"

echo ==========================================================
echo   UPEL SIGOA - SUBIR CAMBIOS A AWS (%SERVER_HOST%)
echo ==========================================================

if not exist "%PEM_KEY%" (
  echo [ERROR] No se encontro upel-key.pem en Desktop ni Downloads.
  pause
  exit /b 1
)

for /f "delims=" %%i in ('git status --porcelain') do goto :dirty_changes
goto :push_step

:dirty_changes
echo [AVISO] Hay cambios locales sin guardar en Git:
git status -s
echo.
set /p "COMMIT_MSG=Escribe un mensaje de commit (o Enter para cancelar): "
if "%COMMIT_MSG%"=="" exit /b 1
git add -u
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo [ERROR] No se pudo crear el commit.
  pause
  exit /b 1
)

:push_step
echo.
echo ==^> 1. Subiendo rama main a GitHub...
git push origin main
if errorlevel 1 (
  echo [ERROR] Fallo git push origin main.
  pause
  exit /b 1
)

echo.
echo ==^> 2. Actualizando servidor AWS y recargando PM2...
ssh -i "%PEM_KEY%" -o StrictHostKeyChecking=accept-new "%SERVER_HOST%" "cd %APP_DIR% && bash server/deploy/deploy.sh && curl -fsS https://3.133.148.107/api/health"
if errorlevel 1 (
  echo [ERROR] Fallo el despliegue en AWS.
  pause
  exit /b 1
)

echo.
echo ==^> 3. Descargando copia externa del respaldo SQL hacia backups_aws\...
if not exist "%~dp0backups_aws" mkdir "%~dp0backups_aws"
for /f "delims=" %%f in ('ssh -i "%PEM_KEY%" -o BatchMode=yes "%SERVER_HOST%" "ls -1t %APP_DIR%/server/uploads/backups/pre_deploy_*.sql 2>/dev/null | head -n 1"') do set "REMOTE_SQL=%%f"
if defined REMOTE_SQL (
  scp -i "%PEM_KEY%" -o BatchMode=yes "%SERVER_HOST%:%REMOTE_SQL%" "%~dp0backups_aws\"
)

echo.
echo [OK] Sistema actualizado y respaldo externo guardado en backups_aws\
pause
