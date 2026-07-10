# Deployment

## 1. Server prerequisites

- Node.js 22 or newer is recommended because this project uses built-in `fetch` and `node:sqlite`.
- A process manager such as PM2 is recommended for public deployment.
- Put the site behind Nginx or Caddy for HTTPS.

## 2. Environment

Copy `.env.example` to your server environment and set at least:

```bash
PORT=4173
OPENAI_API_KEY=sk-...
OPENAI_RECOMMENDER_MODEL=gpt-5.5
```

The recommender still works without `OPENAI_API_KEY`, but it will use only the deterministic rules engine.

## 3. Start with PM2

```bash
npm install
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

Health check:

```bash
curl -i http://127.0.0.1:4173/__health
```

Recommendation API check:

```bash
curl -s -X POST http://127.0.0.1:4173/api/recommendations/compose \
  -H 'Content-Type: application/json' \
  --data '{"budget":20000,"color":"白色","style":"白色 干净 高级"}'
```

## 4. Nginx reverse proxy

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:4173;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

For public deployment, keep HTML/API responses fresh but allow versioned static files to be cached. Enable compression at the proxy too:

```nginx
gzip on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_vary on;
gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:4173;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Use Certbot or your hosting provider to enable HTTPS.

## 5. Caddy reverse proxy

```caddyfile
example.com {
  reverse_proxy 127.0.0.1:4173
}
```

## 6. Price data maintenance

Run price sync periodically so recommendations do not use stale prices:

```bash
node scripts/fetch-prices.mjs --max=1000 --delay=900
```

For production, put that command into cron or a scheduled task during low traffic hours.
