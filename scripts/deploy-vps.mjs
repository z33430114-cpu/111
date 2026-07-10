import fs from "node:fs";
import path from "node:path";
import { Client as SshClient } from "ssh2";

const host = process.env.VPS_HOST || "8.222.129.216";
const port = Number(process.env.VPS_PORT || 22);
const username = process.env.VPS_USER || "admin";
const password = process.env.VPS_PASSWORD;
const sudoPassword = process.env.VPS_SUDO_PASSWORD || password;
const serverName = process.env.VPS_SERVER_NAME || "_";
const aiProvider = process.env.AI_PROVIDER || "rules";
const aiModel = process.env.AI_MODEL || "qwen2.5:7b";
const aiBaseUrl = process.env.AI_BASE_URL || "";
const openaiKey = process.env.OPENAI_API_KEY || "";
const repoRoot = process.cwd();
const remoteRoot = process.env.VPS_REMOTE_ROOT || "/var/www/cs2-relic-hall";
const remoteRelease = `${remoteRoot}/current`;

if (!password) {
  throw new Error("Missing VPS_PASSWORD environment variable.");
}

const excludePathPatterns = [
  /^\.git(?:\/|$)/u,
  /^\.agents(?:\/|$)/u,
  /^\.codex-logs(?:\/|$)/u,
  /^\.tmp-/u,
  /^\.worktrees(?:\/|$)/u,
  /^design-previews(?:\/|$)/u,
  /^intro-film(?:\/|$)/u,
  /^node_modules(?:\/|$)/u,
  /(?:^|\/)\.DS_Store$/u,
  /(?:^|\/)Thumbs\.db$/u,
  /\.log$/u
];
const forceIncludeDataFiles = new Set([
  ".data/market-prices.js",
  ".data/market-prices.json",
  ".data/buff-links.json",
  ".data/youpin-links.json"
]);

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function sudo(command) {
  if (!sudoPassword) return `sudo ${command}`;
  return `printf '%s\n' ${shellQuote(sudoPassword)} | sudo -S ${command}`;
}

function connect() {
  return new Promise((resolve, reject) => {
    const client = new SshClient();
    client
      .on("ready", () => resolve(client))
      .on("error", reject)
      .connect({ host, port, username, password, readyTimeout: 20000 });
  });
}

function exec(client, command) {
  return new Promise((resolve, reject) => {
    client.exec(command, (error, stream) => {
      if (error) return reject(error);
      let stdout = "";
      let stderr = "";
      stream.on("close", (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Command failed (${code}): ${command}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
      });
      stream.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      stream.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    });
  });
}

function sftp(client) {
  return new Promise((resolve, reject) => {
    client.sftp((error, session) => {
      if (error) reject(error);
      else resolve(session);
    });
  });
}

function mkdirRemote(session, remoteDir) {
  return new Promise((resolve, reject) => {
    session.mkdir(remoteDir, { mode: 0o755 }, (error) => {
      if (!error) return resolve();
      if (String(error.message || "").includes("Failure") || String(error.code || "") === "4") return resolve();
      if (String(error.message || "").includes("exists")) return resolve();
      reject(error);
    });
  });
}

async function ensureRemoteDir(session, remoteDir) {
  const normalized = remoteDir.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  let current = normalized.startsWith("/") ? "/" : "";
  for (const part of parts) {
    current = current === "/" ? `/${part}` : `${current}/${part}`;
    await mkdirRemote(session, current);
  }
}

function uploadFile(session, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    session.fastPut(localPath, remotePath, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function shouldUpload(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (forceIncludeDataFiles.has(normalized)) return true;
  if (normalized.startsWith(".data/")) return false;
  return !excludePathPatterns.some((pattern) => pattern.test(normalized));
}

function collectUploadItems(directory = repoRoot, prefix = "") {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (!shouldUpload(relativePath)) continue;
    const localPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      items.push(...collectUploadItems(localPath, relativePath));
      continue;
    }
    if (entry.isFile()) items.push(relativePath);
  }
  return items;
}

async function uploadText(session, remotePath, content) {
  await ensureRemoteDir(session, path.posix.dirname(remotePath));
  return new Promise((resolve, reject) => {
    const stream = session.createWriteStream(remotePath, { encoding: "utf8" });
    stream.on("error", reject);
    stream.on("finish", resolve);
    stream.end(content);
  });
}

async function uploadAll(session) {
  const uploadItems = collectUploadItems().sort();
  for (const item of uploadItems) {
    const localPath = path.join(repoRoot, item);
    if (!fs.existsSync(localPath)) {
      console.warn(`Skipped missing ${item}`);
      continue;
    }
    const remotePath = `${remoteRelease}/${item.replace(/\\/g, "/")}`;
    await ensureRemoteDir(session, path.posix.dirname(remotePath));
    await uploadFile(session, localPath, remotePath);
    console.log(`Uploaded ${item}`);
  }
  console.log(`Uploaded ${uploadItems.length} files total`);
}

function envFile() {
  return [
    "PORT=4173",
    `AI_PROVIDER=${aiProvider}`,
    `AI_MODEL=${aiModel}`,
    aiBaseUrl ? `AI_BASE_URL=${aiBaseUrl}` : "AI_BASE_URL=",
    openaiKey ? `OPENAI_API_KEY=${openaiKey}` : "OPENAI_API_KEY=",
    "OPENAI_RECOMMENDER_MODEL=gpt-5.5",
    "NODE_ENV=production",
    ""
  ].join("\n");
}

function nginxConf() {
  return `gzip on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_vary on;
gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

server {
    listen 80;
    server_name ${serverName};

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
}

function pm2Config() {
  return `module.exports = {
  apps: [
    {
      name: "cs2-skin-atlas",
      script: "scripts/serve.mjs",
      cwd: __dirname,
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 4173,
        AI_PROVIDER: process.env.AI_PROVIDER || "rules",
        AI_MODEL: process.env.AI_MODEL || "qwen2.5:7b",
        AI_BASE_URL: process.env.AI_BASE_URL || "",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        OPENAI_RECOMMENDER_MODEL: process.env.OPENAI_RECOMMENDER_MODEL || "gpt-5.5"
      }
    }
  ]
};
`;
}

async function main() {
  const client = await connect();
  try {
    const who = await exec(client, "whoami && hostname");
    console.log(who.stdout.trim());

    await exec(client, sudo(`mkdir -p ${shellQuote(remoteRelease)} ${shellQuote(remoteRelease)}/.data`));
    await exec(client, sudo(`chown -R ${shellQuote(username)}:${shellQuote(username)} ${shellQuote(remoteRoot)}`));
    const session = await sftp(client);
    try {
      await uploadAll(session);
      await uploadText(session, `${remoteRelease}/.env`, envFile());
      await uploadText(session, `${remoteRelease}/ecosystem.config.cjs`, pm2Config());
      await uploadText(session, `${remoteRelease}/cs2-relic-hall.nginx.conf`, nginxConf());
    } finally {
      session.end?.();
    }

    await exec(client, "command -v node && node -v").catch(async () => {
      await exec(client, sudo("dnf install -y nodejs npm || yum install -y nodejs npm || apt-get update && apt-get install -y nodejs npm"));
    });
    await exec(client, "command -v nginx || " + sudo("dnf install -y nginx || yum install -y nginx || apt-get update && apt-get install -y nginx"));
    await exec(client, "command -v pm2 || " + sudo("npm install -g pm2"));
    await exec(client, `cd ${shellQuote(remoteRelease)} && npm install --omit=optional`);
    await exec(client, `cd ${shellQuote(remoteRelease)} && set -a && . ./.env && set +a && pm2 startOrReload ecosystem.config.cjs --update-env`);
    await exec(client, "pm2 save || true");

    await exec(client, sudo(`cp ${shellQuote(remoteRelease)}/cs2-relic-hall.nginx.conf /etc/nginx/conf.d/cs2-relic-hall.conf`));
    await exec(client, sudo("nginx -t"));
    await exec(client, sudo("systemctl enable nginx"));
    await exec(client, sudo("systemctl restart nginx"));

    const health = await exec(client, "curl -fsS http://127.0.0.1:4173/__health -o /dev/null -w '%{http_code}'");
    const publicCheck = await exec(client, "curl -I -m 10 http://127.0.0.1/ | head -n 1");
    console.log(`Node health: ${health.stdout.trim()}`);
    console.log(publicCheck.stdout.trim());
  } finally {
    client.end();
  }
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
