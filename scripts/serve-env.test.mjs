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
    } catch {
      await wait(100);
    }
  }
  assert.fail(`server did not listen on explicit PORT ${port}`);
}

test("serve respects an explicit PORT environment variable over .env", async () => {
  const port = 4199;
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForHealth(port, child);
  } finally {
    child.kill("SIGTERM");
  }
});
