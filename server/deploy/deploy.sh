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
      --no-tablespaces \
      --routines \
      --triggers \
      "$DB_NAME" > "$BACKUP_FILE"
    echo "    Respaldo guardado en: $BACKUP_FILE"
    ls -1t "$BACKUP_DIR"/pre_deploy_*.sql 2>/dev/null | tail -n +11 | xargs -r rm -f || true
  fi
fi

echo "==> 2. Descargando últimos cambios desde origin/main..."
BEFORE_SHA="$(git rev-parse HEAD 2>/dev/null || echo '')"
git fetch origin
git reset --hard origin/main

echo "==> 3. Actualizando dependencias solo si cambiaron..."
CHANGED_FILES=""
if [[ -n "$BEFORE_SHA" ]]; then
  CHANGED_FILES="$(git diff --name-only "$BEFORE_SHA" HEAD 2>/dev/null || true)"
fi
if [[ ! -d "$APP_DIR/node_modules" ]] || echo "$CHANGED_FILES" | grep -qE '^package(-lock)?\.json$'; then
  npm install --no-audit --no-fund
fi
if [[ -d "$APP_DIR/server" ]] && { [[ ! -d "$APP_DIR/server/node_modules" ]] || echo "$CHANGED_FILES" | grep -qE '^server/package(-lock)?\.json$'; }; then
  (cd "$APP_DIR/server" && npm install --no-audit --no-fund)
fi

echo "==> 4. Compilando frontend..."
npm run build

echo "==> 5. Recargando servidor backend con PM2..."
pm2 reload "$PM2_APP" --update-env
pm2 save

echo "==> 6. Verificando salud local (backend + MySQL)..."
LOCAL_PORT="${PORT:-3001}"
if [[ -f "$APP_DIR/server/.env" ]]; then
  ENV_PORT="$(grep -E '^PORT=' "$APP_DIR/server/.env" | tail -n1 | cut -d= -f2 | tr -d '\r' || true)"
  if [[ -n "$ENV_PORT" ]]; then LOCAL_PORT="$ENV_PORT"; fi
fi
HEALTH_OK=0
for i in $(seq 1 10); do
  if curl -fsS --max-time 3 "http://127.0.0.1:${LOCAL_PORT}/api/health" >/dev/null 2>&1; then
    HEALTH_OK=1
    curl -fsS --max-time 3 "http://127.0.0.1:${LOCAL_PORT}/api/health"
    echo ""
    break
  fi
  sleep 1
done
if [[ "$HEALTH_OK" -ne 1 ]]; then
  echo "ERROR: /api/health no respondio tras recargar PM2."
  exit 1
fi

echo "==> Actualización completada con éxito."
