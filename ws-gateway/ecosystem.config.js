// PM2 process file — keep the gateway alive on the VPS.
// Usage:  pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: "ws-gateway",
      script: "server.js",
      cwd: __dirname,
      instances: 1, // keep 1 — rooms are in-process memory; >1 needs the Redis adapter
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
