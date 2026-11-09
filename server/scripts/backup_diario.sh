#!/bin/bash
# =======================================================================
# UPEL SIGOA - Respaldo Diario y Sincronización en la Nube (Linux/VPS)
# =======================================================================

FECHA=$(date +%Y-%m-%d_%H-%M)
DESTINO="/var/backups/sigoa"
ARCHIVO="sigoa_backup_$FECHA.sql.gz"

mkdir -p "$DESTINO"

# 1. Exportar la base de datos MySQL comprimida en gzip
mysqldump -u upel_user -p'tu_password_seguro' upel_talento_humano | gzip > "$DESTINO/$ARCHIVO"

# 2. Rotación FIFO: Borrar respaldos locales con más de 7 días
find "$DESTINO" -type f -name "*.sql.gz" -mtime +7 -delete

# 3. Sincronizar automáticamente hacia Google Drive con rclone si está instalado
if command -v rclone &> /dev/null; then
    rclone copy "$DESTINO/$ARCHIVO" gdrive:Respaldos_UPEL_SIGOA/
fi

echo "Respaldo $ARCHIVO completado con éxito."
