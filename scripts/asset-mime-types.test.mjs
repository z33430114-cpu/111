import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

const assetRequests = [
  ["/assets/halls/generated/map-cache.svg", "image/svg+xml"],
  ["/assets/halls/map-train.png", "image/png"]
];

async function waitForServer(port, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/__health`);
      if (response.status === 204) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Server on port ${port} did not become ready within ${timeoutMs}ms`);
}

async function withServer(script, port, run) {
  const child = spawn(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });

  try {
    await waitForServer(port);
    await run();
  } finally {
    child.kill("SIGTERM");
    await Promise.race([
      once(child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ]);
    if (child.exitCode && child.exitCode !== 0 && stderr.trim()) {
      throw new Error(stderr.trim());
    }
  }
}

for (const [script, port] of [["scripts/static-serve.mjs", 4181], ["scripts/serve.mjs", 4182]]) {
  test(`${script} serves hall map assets with image MIME types`, async () => {
    await withServer(script, port, async () => {
      for (const [pathname, expectedType] of assetRequests) {
        const response = await fetch(`http://127.0.0.1:${port}${pathname}`);
        assert.equal(response.status, 200, `${pathname} should be served`);
        assert.match(
          response.headers.get("content-type") || "",
          new RegExp(`^${expectedType.replace("+", "\\+")}`),
          `${pathname} should use ${expectedType}`
        );
      }
    });
  });
}
