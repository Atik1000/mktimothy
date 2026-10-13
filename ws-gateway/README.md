# ws-gateway — Realtime Gateway (VPS)

Socket.IO relay that powers live chat, call ringing, and WebRTC signaling for
mktimothy.com. Runs on the VPS behind Nginx at `wss://relay.quickwebs.site`.

- Full contract + architecture: `../docs/realtime-implementation-guide.md`
- Files: `server.js` (gateway) · `ecosystem.config.js` (PM2) ·
  `nginx-relay.conf` (proxy) · `.env.example` (secrets template)

## Deploy (fresh VPS)

```bash
# 1. Node 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs

# 2. Copy this folder to the VPS, then:
cd ws-gateway
npm install --omit=dev

# 3. Secrets
cp .env.example .env
nano .env        # set JWT_SECRET (= app's GATEWAY_JWT_SECRET) and API_KEY
openssl rand -base64 36   # handy generator for API_KEY

# 4. Keep it alive
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup    # follow the printed instruction

# 5. Nginx + TLS
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp nginx-relay.conf /etc/nginx/sites-available/relay.quickwebs.site
sudo ln -s /etc/nginx/sites-available/relay.quickwebs.site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d relay.quickwebs.site

# 6. Firewall — never expose the gateway directly
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

## Verify

```bash
curl https://relay.quickwebs.site/health
# {"ok":true,"uptime":...,"sockets":...,"rooms":...}

pm2 logs ws-gateway --lines 50
```

## Update / rollback

```bash
# after editing server.js on the VPS:
pm2 restart ws-gateway
# rollback: git checkout <prev> && pm2 restart ws-gateway
```

## Scaling note

`instances: 1` on purpose — room membership lives in process memory. To run
multiple instances, add `@socket.io/redis-adapter` + Redis and remove the
comment in `ecosystem.config.js`. One instance comfortably handles thousands
of idle sockets (~50–100MB RAM for 5k connections).
