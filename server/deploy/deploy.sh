#!/usr/bin/env bash
set -euo pipefail

# UPEL SIGOA - Script de actualización segura en producción (AWS EC2)
# NO borra ni sobreescribe la base de datos MySQL; crea un respaldo .sql previo antes de actualizar.

APP_DIR="${APP_DIR:-/var/www/upel-sigoa}"
PM2_APP="${PM2_APP:-upel-sigoa}"
BACKUP_DIR="$APP_DIR/server/uploads/backups"

cd "$APP_DIR"

echo "==> 1. Respaldo preventivo de la base de datos..."
mkdir -p "$BACKUP_DIR"
if [[ -f "$APP_DIR/server/.env" ]] && command -v mysqldump >/dev/null 2>&1; then
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/server/.env"
  set +a
  STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
  BACKUP_FILE="$BACKUP_DIR/pre_deploy_${STAMP}.sql"
  if [[ -n "${DB_NAME:-}" && -n "${DB_USER:-}" ]]; then
    MYSQL_PWD="${DB_PASSWORD:-}" mysqldump \
      -h "${DB_HOST:-127.0.0.1}" \
      -P "${DB_PORT:-3306}" \
      -u "$DB_USER" \
      --single-transaction \
      --routines \
      --triggers \
      "$DB_NAME" > "$BACKUP_FILE"
    echo "    Respaldo guardado en: $BACKUP_FILE"
  fi
fi

echo "==> 2. Descargando últimos cambios desde origin/main..."
git fetch origin
git reset --hard origin/main

echo "==> 3. Instalando dependencias si aplica..."
npm ci --no-audit --no-fund
if [[ -d "$APP_DIR/server" ]]; then
  (cd "$APP_DIR/server" && npm ci --no-audit --no-fund)
fi

echo "==> 4. Compilando frontend..."
npm run build

echo "==> 5. Recargando servidor backend con PM2..."
pm2 reload "$PM2_APP"
pm2 save

echo "==> Actualización completada con éxito."
