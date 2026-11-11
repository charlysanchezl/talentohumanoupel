#!/usr/bin/env bash
set -euo pipefail

# UPEL SIGOA - HTTPS gratuito directo para IP pública SIN DOMINIO
# Utiliza certificados de vida corta (6 días, renovación automática) de Let's Encrypt + Nginx
# Uso:
#   sudo bash server/deploy/enable-https-ip-aws.sh 3.133.148.107 tu_correo@gmail.com

PUBLIC_IP="${1:-}"
EMAIL="${2:-}"
APP_DIR="${APP_DIR:-/var/www/upel-sigoa}"

if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="$(curl -fsS --max-time 5 https://checkip.amazonaws.com 2>/dev/null || true)"
fi

if [[ -z "$PUBLIC_IP" || -z "$EMAIL" ]]; then
  echo "Uso: sudo bash server/deploy/enable-https-ip-aws.sh <IP_PUBLICA> <CORREO_CERTBOT>"
  echo "Ejemplo: sudo bash server/deploy/enable-https-ip-aws.sh 3.133.148.107 admin@gmail.com"
  exit 1
fi

if [[ "$EUID" -ne 0 ]]; then
  echo "Este script debe ejecutarse con sudo."
  exit 1
fi

echo "==> 1. Verificando IP pública ($PUBLIC_IP) e instalando Nginx..."
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y nginx curl python3-venv
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y nginx curl python3
elif command -v yum >/dev/null 2>&1; then
  yum install -y nginx curl python3
else
  echo "Gestor de paquetes no soportado automáticamente."
  exit 1
fi

mkdir -p /var/www/html

echo "==> 2. Instalando/actualizando Certbot >= 5.4.0 (vía Python venv, sin depender de Snap Store)..."
CERTBOT_BIN="/opt/certbot/bin/certbot"
python3 -m venv /opt/certbot
/opt/certbot/bin/pip install --upgrade pip "certbot>=5.4.0"
ln -sf /opt/certbot/bin/certbot /usr/bin/certbot

CERTBOT_VER="$($CERTBOT_BIN --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || echo '0.0.0')"
echo "    Certbot instalado: $CERTBOT_VER"
if ! python3 -c "import sys; v=tuple(map(int, '$CERTBOT_VER'.split('.'))); sys.exit(0 if v >= (5,4,0) else 1)"; then
  echo "ERROR: Se requiere Certbot >= 5.4.0 para certificados por IP sin dominio con webroot (actual: $CERTBOT_VER)."
  exit 1
fi

if [[ -d /etc/nginx/sites-available ]]; then
  CONF_PATH="/etc/nginx/sites-available/upel-sigoa"
  ln -sf "$CONF_PATH" /etc/nginx/sites-enabled/upel-sigoa
  rm -f /etc/nginx/sites-enabled/default
else
  CONF_PATH="/etc/nginx/conf.d/upel-sigoa.conf"
fi

if ss -tlnp 2>/dev/null | grep -E ':80\b' | grep -qi 'node'; then
  echo "AVISO: Node.js está escuchando actualmente directo en el puerto 80."
  echo "Cambia PORT=3001 en $APP_DIR/server/.env, ejecuta 'pm2 restart upel-sigoa' y vuelve a correr este script para que Nginx pueda usar el puerto 80 y 443."
  exit 1
fi

echo "==> 3. Configurando Nginx temporal en puerto 80 para validación ACME..."
cat > "$CONF_PATH" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $PUBLIC_IP _;

    server_tokens off;
    client_max_body_size 15M;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type "text/plain";
        try_files \$uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> 4. Solicitando certificado Let's Encrypt (perfil shortlived para IP $PUBLIC_IP)..."
"$CERTBOT_BIN" certonly \
  --non-interactive \
  --agree-tos \
  --preferred-profile shortlived \
  --webroot \
  --webroot-path /var/www/html \
  --ip-address "$PUBLIC_IP" \
  -m "$EMAIL" \
  --deploy-hook "systemctl reload nginx"

CERT_DIR="/etc/letsencrypt/live/$PUBLIC_IP"
if [[ ! -f "$CERT_DIR/fullchain.pem" || ! -f "$CERT_DIR/privkey.pem" ]]; then
  echo "ERROR: No se encontraron los certificados en $CERT_DIR"
  exit 1
fi

echo "==> 5. Activando Nginx con HTTPS + compresión Gzip + redirección HTTP->HTTPS..."
cat > "$CONF_PATH" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $PUBLIC_IP _;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type "text/plain";
        try_files \$uri =404;
    }

    location / {
        return 301 https://$PUBLIC_IP\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $PUBLIC_IP _;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    server_tokens off;
    client_max_body_size 15M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml
        font/woff2;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
EOF

nginx -t
systemctl reload nginx

echo "==> 6. Configurando renovación automática (cada 12h para certificados de 6 días)..."
cat > /etc/cron.d/certbot-sigoa-ip <<EOF
0 */12 * * * root $CERTBOT_BIN renew -q --deploy-hook "systemctl reload nginx"
EOF
chmod 644 /etc/cron.d/certbot-sigoa-ip

"$CERTBOT_BIN" renew --dry-run || echo "AVISO: La simulación de renovación falló; verifica luego con: sudo $CERTBOT_BIN renew --dry-run"

if command -v pm2 >/dev/null 2>&1; then
  pm2 reload upel-sigoa || true
fi

echo ""
echo "=============================================================="
echo " LISTO: SIGOA operando SIN ADVERTENCIA en https://$PUBLIC_IP"
echo "=============================================================="
echo " Requisitos en AWS Security Group:"
echo "  - Puerto 80  (TCP): abierto a 0.0.0.0/0 (para renovar SSL)"
echo "  - Puerto 443 (TCP): abierto a 0.0.0.0/0 (tráfico HTTPS)"
echo "  - Puerto 22  (SSH): restringido a tu IP"
echo "  - Puertos 3001 y 3306: cerrados al público"
echo "=============================================================="
