#!/usr/bin/env bash
set -euo pipefail

# UPEL SIGOA - Instalador automático de Dominio + HTTPS (Nginx + Let's Encrypt) en AWS EC2
# Uso:
#   sudo bash server/deploy/enable-https-aws.sh sigoaupel.duckdns.org admin@upel.edu.ve

DOMAIN="${1:-}"
EMAIL="${2:-}"
APP_DIR="${APP_DIR:-/var/www/upel-sigoa}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Uso: sudo bash server/deploy/enable-https-aws.sh <DOMINIO> <CORREO_CERTBOT>"
  echo "Ejemplo: sudo bash server/deploy/enable-https-aws.sh sigoaupel.duckdns.org tu_correo@gmail.com"
  exit 1
fi

if [[ "$EUID" -ne 0 ]]; then
  echo "Este script debe ejecutarse con sudo."
  exit 1
fi

echo "==> 1. Verificando DNS de $DOMAIN..."
PUBLIC_IP="$(curl -fsS --max-time 5 https://checkip.amazonaws.com 2>/dev/null || hostname -I | awk '{print $1}')"
RESOLVED_IP="$(getent ahostsv4 "$DOMAIN" | awk '{print $1}' | head -n1 || true)"

if [[ -z "$RESOLVED_IP" ]]; then
  echo "ERROR: El dominio $DOMAIN aún no resuelve en DNS. Configura el registro A hacia $PUBLIC_IP primero."
  exit 1
fi

echo "    IP pública del servidor : $PUBLIC_IP"
echo "    IP resuelta por DNS     : $RESOLVED_IP"
if [[ "$RESOLVED_IP" != "$PUBLIC_IP" ]]; then
  echo "AVISO: $DOMAIN apunta a $RESOLVED_IP y no coincide con $PUBLIC_IP. Asegúrate de que el DNS esté actualizado antes de continuar."
fi

echo "==> 2. Instalando Nginx y Certbot..."
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y nginx certbot python3-certbot-nginx
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y nginx certbot python3-certbot-nginx
elif command -v yum >/dev/null 2>&1; then
  yum install -y nginx certbot python3-certbot-nginx
else
  echo "Gestor de paquetes no soportado automáticamente. Instala nginx y certbot manualmente."
  exit 1
fi

mkdir -p /var/www/html

echo "==> 3. Generando configuración Nginx para $DOMAIN..."
TEMPLATE="$APP_DIR/server/deploy/nginx-sigoa.conf"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "ERROR: No se encontró $TEMPLATE"
  exit 1
fi

if [[ -d /etc/nginx/sites-available ]]; then
  CONF_PATH="/etc/nginx/sites-available/upel-sigoa"
  sed "s/__DOMAIN__/$DOMAIN/g" "$TEMPLATE" > "$CONF_PATH"
  ln -sf "$CONF_PATH" /etc/nginx/sites-enabled/upel-sigoa
  rm -f /etc/nginx/sites-enabled/default
else
  CONF_PATH="/etc/nginx/conf.d/upel-sigoa.conf"
  sed "s/__DOMAIN__/$DOMAIN/g" "$TEMPLATE" > "$CONF_PATH"
fi

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> 4. Emitiendo certificado SSL gratuito con Let's Encrypt..."
certbot --nginx --non-interactive --agree-tos --redirect -m "$EMAIL" -d "$DOMAIN"

echo "==> 5. Verificando renovación automática SSL..."
certbot renew --dry-run

ENV_FILE="$APP_DIR/server/.env"
if [[ -f "$ENV_FILE" ]]; then
  if ! grep -q '^APP_DOMAIN=' "$ENV_FILE"; then
    printf "\nAPP_DOMAIN=%s\n" "$DOMAIN" >> "$ENV_FILE"
  else
    sed -i "s/^APP_DOMAIN=.*/APP_DOMAIN=$DOMAIN/" "$ENV_FILE"
  fi
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 reload upel-sigoa || true
fi

echo ""
echo "=========================================================="
echo " LISTO: SIGOA operando con HTTPS en https://$DOMAIN"
echo "=========================================================="
echo " Siguientes recomendaciones en AWS Security Group:"
echo "  - Mantén abiertos: 80 (TCP) y 443 (TCP)"
echo "  - Restringe 22 (SSH) solo a tu IP"
echo "  - Cierra acceso público a los puertos 3001 y 3306"
echo "=========================================================="
