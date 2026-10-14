#!/usr/bin/env bash
# One-shot deploy of the Next.js site to a fresh Ubuntu/Debian server.
# Serves it at https://<server-ip>:5000 (self-signed cert) via a NEW nginx
# server block. Existing sites/ports (80, 443, 8000 chatbot) are not touched.
#
# Run as root on the server:
#   ADMIN_PASSWORD='choose-a-strong-password' bash deploy-server.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Atik1000/mktimothy.git}"
APP_DIR=/opt/mktimothy
APP_PORT=3100          # internal Next.js port (127.0.0.1 only)
PUBLIC_PORT=5000       # public HTTPS port
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@mktimothy.com}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD}"
SERVER_IP="$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')"

for p in "$PUBLIC_PORT" "$APP_PORT"; do
  if ss -tln | awk '{print $4}' | grep -qE "[:.]${p}$"; then
    echo "Port $p is already in use on this server - aborting so nothing breaks."; exit 1
  fi
done

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx postgresql openssl ca-certificates

# Node 20
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Postgres: dedicated DB + user
DB_PASS="$(openssl rand -hex 16)"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='mktimothy'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER mktimothy WITH PASSWORD '${DB_PASS}'"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='mktimothy'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE mktimothy OWNER mktimothy"
EXISTING_ENV=0; [ -f "$APP_DIR/.env.local" ] && EXISTING_ENV=1

# Code
if [ -d "$APP_DIR/.git" ]; then git -C "$APP_DIR" pull --ff-only; else git clone "$REPO_URL" "$APP_DIR"; fi
cd "$APP_DIR"

if [ "$EXISTING_ENV" = 0 ]; then
  sudo -u postgres psql -c "ALTER USER mktimothy WITH PASSWORD '${DB_PASS}'"
  cat > .env.local <<EOF
DATABASE_URL="postgresql://mktimothy:${DB_PASS}@127.0.0.1:5432/mktimothy"
JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
NEXT_PUBLIC_APP_URL="https://${SERVER_IP}:${PUBLIC_PORT}"
NEXTAUTH_URL="https://${SERVER_IP}:${PUBLIC_PORT}"
CHATBOT_BASE_URL="https://ai.mktimothy.com"
EOF
  chmod 600 .env.local
fi
set -a; . ./.env.local; set +a

npm install --legacy-peer-deps --no-audit --no-fund
npx prisma generate
npx prisma db push --skip-generate
npm run build

# Admin user (APPROVED so login works)
ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" node -e '
const {PrismaClient}=require("@prisma/client");const bcrypt=require("bcryptjs");
const p=new PrismaClient();
(async()=>{const password=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
const d={password,role:"ADMIN",emailVerified:true,isActive:true,approvalStatus:"APPROVED"};
await p.user.upsert({where:{email:process.env.ADMIN_EMAIL},update:d,create:{email:process.env.ADMIN_EMAIL,firstName:"Admin",lastName:"User",...d}});
console.log("admin ready");await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})'

# systemd service
cat > /etc/systemd/system/mktimothy.service <<EOF
[Unit]
Description=mktimothy Next.js site
After=network.target postgresql.service
[Service]
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env.local
Environment=NODE_ENV=production
ExecStart=/usr/bin/env npx next start -H 127.0.0.1 -p ${APP_PORT}
Restart=always
User=root
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now mktimothy
systemctl restart mktimothy

# nginx: new HTTPS server block on PUBLIC_PORT only
mkdir -p /etc/nginx/ssl
[ -f /etc/nginx/ssl/mktimothy.crt ] || openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout /etc/nginx/ssl/mktimothy.key -out /etc/nginx/ssl/mktimothy.crt \
  -subj "/CN=${SERVER_IP}" -addext "subjectAltName=IP:${SERVER_IP}"
cat > /etc/nginx/conf.d/mktimothy-site.conf <<EOF
server {
  listen ${PUBLIC_PORT} ssl;
  server_name _;
  ssl_certificate /etc/nginx/ssl/mktimothy.crt;
  ssl_certificate_key /etc/nginx/ssl/mktimothy.key;
  client_max_body_size 50m;
  location / {
    proxy_pass http://127.0.0.1:${APP_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF
nginx -t
systemctl reload nginx
command -v ufw >/dev/null && ufw status | grep -q active && ufw allow ${PUBLIC_PORT}/tcp || true

echo
echo "Done. Open: https://${SERVER_IP}:${PUBLIC_PORT}/login  (accept the self-signed certificate warning)"
echo "Admin login: ${ADMIN_EMAIL}  (the password you set)"
