import test from "node:test";
import assert from "node:assert/strict";
import { app } from "./server.js";

test("health endpoint is live without a database", async () => {
  const server = app.listen(0, "127.0.0.1");
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/healthz`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  } finally {
    await new Promise((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});

test("readiness refuses to claim ready when database is not configured", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const server = app.listen(0, "127.0.0.1");
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/readyz`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      status: "not_ready",
      reason: "database_not_configured"
    });
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous;
    await new Promise((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
