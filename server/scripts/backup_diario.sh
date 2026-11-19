#!/usr/bin/env bash
set -euo pipefail

# =======================================================================
# UPEL SIGOA - Respaldo Diario Automático (MySQL + Google Drive via rclone)
# =======================================================================

APP_DIR="${APP_DIR:-/var/www/upel-sigoa}"
ENV_FILE="$APP_DIR/server/.env"
DESTINO="$APP_DIR/server/uploads/backups/diarios"
REMOTE_NAME="${RCLONE_REMOTE:-gdrive}"
REMOTE_DIR="${RCLONE_DIR:-Respaldos_UPEL_SIGOA/diarios}"
RETENCION_LOCAL_DIAS="${RETENCION_LOCAL_DIAS:-7}"
RETENCION_NUBE_DIAS="${RETENCION_NUBE_DIAS:-30}"

FECHA="$(date +%Y-%m-%d_%H-%M-%S)"
ARCHIVO="sigoa_diario_${FECHA}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando respaldo diario UPEL SIGOA..."

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] No se encontró $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

mkdir -p "$DESTINO"

# 1. Exportar la base de datos MySQL de forma consistente y comprimida (.sql.gz)
MYSQL_PWD="${DB_PASSWORD:-}" mysqldump \
  -h "${DB_HOST:-127.0.0.1}" \
  -P "${DB_PORT:-3306}" \
  -u "$DB_USER" \
  --single-transaction \
  --no-tablespaces \
  --routines \
  --triggers \
  "$DB_NAME" | gzip -9 > "$DESTINO/$ARCHIVO"

TAMANO="$(du -h "$DESTINO/$ARCHIVO" | cut -f1)"
echo "[OK] Respaldo local creado: $DESTINO/$ARCHIVO ($TAMANO)"

# 2. Rotación local: borrar respaldos locales con más de RETENCION_LOCAL_DIAS días
find "$DESTINO" -type f -name "sigoa_diario_*.sql.gz" -mtime +"$RETENCION_LOCAL_DIAS" -delete

# 3. Sincronizar hacia Google Drive con rclone si el remoto está configurado
if command -v rclone >/dev/null 2>&1; then
  if rclone listremotes | grep -q "^${REMOTE_NAME}:$"; then
    rclone copy "$DESTINO/$ARCHIVO" "${REMOTE_NAME}:${REMOTE_DIR}/"
    echo "[OK] Respaldo subido a ${REMOTE_NAME}:${REMOTE_DIR}/$ARCHIVO"
    # Rotación en la nube: eliminar respaldos con más de RETENCION_NUBE_DIAS días
    rclone delete --min-age "${RETENCION_NUBE_DIAS}d" "${REMOTE_NAME}:${REMOTE_DIR}/" || true
  else
    echo "[AVISO] rclone está instalado, pero el remoto '${REMOTE_NAME}:' aún no está configurado."
  fi
else
  echo "[AVISO] rclone no está instalado; solo se guardó el respaldo local."
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Respaldo diario finalizado."
