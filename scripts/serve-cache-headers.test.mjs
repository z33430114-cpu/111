import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(port, child) {
  const url = `http://127.0.0.1:${port}/__health`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    assert.equal(child.exitCode, null, "server exited before health check passed");
    try {
      const response = await fetch(url);
      if (response.status === 204) return;
    } catch {}
    await wait(100);
  }
  assert.fail(`server did not listen on explicit PORT ${port}`);
}

test("serve does not mark top-level app.js as immutable without a version query", async () => {
  const port = 4201;
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
    const response = await fetch(`http://127.0.0.1:${port}/app.js`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store, no-cache, must-revalidate, max-age=0");
  } finally {
    child.kill("SIGTERM");
  }
});

test("serve marks versioned script assets as immutable", async () => {
  const port = 4202;
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
    const response = await fetch(`http://127.0.0.1:${port}/app.js?v=test`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  } finally {
    child.kill("SIGTERM");
  }
});

test("static server marks versioned script assets as immutable", async () => {
  const port = 4203;
  const child = spawn(process.execPath, ["scripts/static-serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
    const response = await fetch(`http://127.0.0.1:${port}/app.js?v=test`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  } finally {
    child.kill("SIGTERM");
  }
});

test("serve compresses large JavaScript assets when the client supports gzip", async () => {
  const port = 4204;
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
    const response = await fetch(`http://127.0.0.1:${port}/app.js?v=test`, {
      headers: { "Accept-Encoding": "gzip" }
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-encoding"), "gzip");
  } finally {
    child.kill("SIGTERM");
  }
});

test("serve delivers the catalog payload with low-latency Brotli compression", async () => {
  const port = 4205;
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
    const startedAt = Date.now();
    const response = await fetch(`http://127.0.0.1:${port}/catalog-data.js?v=test`, {
      headers: { "Accept-Encoding": "br" }
    });
    await response.arrayBuffer();
    const elapsedMs = Date.now() - startedAt;
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-encoding"), "br");
    assert.ok(elapsedMs < 15000, `catalog Brotli response took ${elapsedMs}ms`);
  } finally {
    child.kill("SIGTERM");
  }
});
