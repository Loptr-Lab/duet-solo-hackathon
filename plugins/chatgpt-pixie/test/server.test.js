import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createHttpServer } from "../src/server.js";
import { CATALOG_CAPTURED_AT, PIXIE_SURFACES, PROJECTS } from "../src/catalog.mjs";

let server;
let client;
let baseUrl;

before(async () => {
  server = createHttpServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  client = new Client({ name: "pixie-companion-tests", version: "1.0.0" }, { capabilities: {} });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)));
});

after(async () => {
  await client?.close();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
});

test("health endpoint reports the bundled snapshot without exposing request data", async () => {
  const response = await fetch(`${baseUrl}/healthz`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    status: "ok",
    plugin: "pixie-project-companion",
    catalogCapturedAt: CATALOG_CAPTURED_AT,
    projectCount: PROJECTS.length,
    pixieSurfaceCount: PIXIE_SURFACES.length,
  });
  const headResponse = await fetch(`${baseUrl}/healthz`, { method: "HEAD" });
  assert.equal(headResponse.status, 200);
  assert.equal(await headResponse.text(), "");
});

test("advertises focused, read-only tools with accurate annotations", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    "get_ecosystem_entry",
    "list_pixie_surfaces",
    "search_ecosystem",
    "suggest_ecosystem_path",
  ]);
  for (const tool of tools) {
    assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} should be read-only`);
    assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} cannot be destructive`);
    assert.equal(tool.annotations?.openWorldHint, false, `${tool.name} reads only its bundled catalog`);
    assert.ok(tool.inputSchema);
    assert.ok(tool.outputSchema);
  }
});

test("search returns evidence-linked entries and a dated, non-live snapshot notice", async () => {
  const result = await client.callTool({
    name: "search_ecosystem",
    arguments: { query: "device", scope: "all", limit: 10, offset: 0 },
  });
  assert.notEqual(result.isError, true);
  assert.match(result.content[0].text, /curated public-source snapshot/i);
  assert.equal(result.structuredContent.capturedAt, CATALOG_CAPTURED_AT);
  assert.ok(result.structuredContent.entries.length > 0);
  assert.ok(result.structuredContent.entries.some((entry) => entry.id === "pixie-device-stewardship"));
  for (const entry of result.structuredContent.entries) {
    assert.ok(entry.links.length > 0, `${entry.id} must have a source link`);
    for (const link of entry.links) assert.equal(new URL(link.url).protocol, "https:");
  }
});

test("exact lookup describes the distinct scope and returns a safe not-found result", async () => {
  const found = await client.callTool({
    name: "get_ecosystem_entry",
    arguments: { id: "surface-holdings" },
  });
  assert.equal(found.structuredContent.found, true);
  assert.equal(found.structuredContent.entry.kind, "pixie_surface");
  assert.match(found.structuredContent.entry.boundary, /not a remote-control permission/i);
  assert.equal(found.structuredContent.statusDefinitions.unverified.includes("not established"), true);

  const missing = await client.callTool({
    name: "get_ecosystem_entry",
    arguments: { id: "made-up-project" },
  });
  assert.equal(missing.structuredContent.found, false);
  assert.equal(missing.structuredContent.entry, null);
});

test("surface listing preserves separate per-surface status and boundaries", async () => {
  const result = await client.callTool({
    name: "list_pixie_surfaces",
    arguments: { limit: 20, offset: 0 },
  });
  assert.equal(result.structuredContent.total, PIXIE_SURFACES.length);
  assert.equal(result.structuredContent.surfaces.length, PIXIE_SURFACES.length);
  assert.ok(result.structuredContent.surfaces.some((surface) => surface.id === "surface-duet"));
  assert.ok(result.structuredContent.surfaces.every((surface) => surface.kind === "pixie_surface"));
  assert.ok(result.structuredContent.surfaces.every((surface) => surface.links.length > 0));
});

test("bounded path suggestions do not imply that the server acts for the user", async () => {
  const result = await client.callTool({
    name: "suggest_ecosystem_path",
    arguments: { intent: "contribute" },
  });
  assert.equal(result.structuredContent.intent, "contribute");
  assert.ok(result.structuredContent.entries.length > 0);
  assert.match(result.structuredContent.guidance, /check scope before contributing/i);
  assert.match(result.content[0].text, /does not check live pages/i);
});

test("invalid tool arguments are rejected by the registered schema", async () => {
  const result = await client.callTool({
    name: "suggest_ecosystem_path",
    arguments: { intent: "delete_everything" },
  });
  assert.equal(result.isError, true);
});
