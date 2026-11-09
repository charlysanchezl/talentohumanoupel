# Script seguro de control de versiones Git para UPEL SIGOA
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   UPEL SIGOA - CONTROL DE VERSIONES LOCAL SEGURO          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Verificación de seguridad: Evitar subidas no autorizadas o accidentales a repositorios externos
Write-Host "[SEGURIDAD] Por directriz de ciberseguridad, el empuje automatico (git push)" -ForegroundColor Yellow
Write-Host "            a repositorios externos publicos esta bloqueado para proteger la PII." -ForegroundColor Yellow
Write-Host "            Si requiere sincronizar, configure el repositorio institucional oficial." -ForegroundColor Yellow
Write-Host ""

$git = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

# Crear commit local seguro respetando .gitignore
& $git add .gitignore server/index.js server/utils/ src/
Write-Host "[OK] Cambios preparados respetando .gitignore." -ForegroundColor Green
