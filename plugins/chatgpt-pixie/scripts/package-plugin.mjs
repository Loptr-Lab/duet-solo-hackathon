import { execFileSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, "..");
const outputDir = join(packageDir, "dist");
const endpoint = process.env.PIXIE_MCP_URL;
const expectedTools = [
  "get_ecosystem_entry",
  "list_pixie_surfaces",
  "search_ecosystem",
  "suggest_ecosystem_path",
];

function validateEndpoint(value) {
  if (!value) {
    throw new Error("Set PIXIE_MCP_URL to the deployed MCP endpoint, for example https://your-host.example.invalid/mcp.");
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("PIXIE_MCP_URL must be a valid absolute URL.");
  }
  const reservedHost =
    parsed.hostname === "localhost" ||
    parsed.hostname.endsWith(".localhost") ||
    parsed.hostname.endsWith(".local") ||
    parsed.hostname.endsWith(".example") ||
    parsed.hostname.endsWith(".invalid") ||
    parsed.hostname.endsWith(".test");
  if (
    parsed.protocol !== "https:" ||
    parsed.pathname !== "/mcp" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.port ||
    isIP(parsed.hostname) ||
    reservedHost
  ) {
    throw new Error("PIXIE_MCP_URL must be a stable public HTTPS URL ending in /mcp, without credentials, nonstandard ports, query, fragment, or placeholder/local host.");
  }
  return parsed.toString();
}

async function verifyEndpoint(url) {
  const healthUrl = new URL("/healthz", url);
  const response = await fetch(healthUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`The deployed health check returned HTTP ${response.status}.`);
  const health = await response.json();
  if (health.status !== "ok" || health.plugin !== "pixie-project-companion") {
    throw new Error("The health endpoint did not identify a ready PIXIE Project Companion server.");
  }

  const client = new Client({ name: "pixie-plugin-packager", version: "1.0.0" }, { capabilities: {} });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(url)));
    const { tools } = await client.listTools();
    const actualTools = tools.map((tool) => tool.name).sort();
    if (JSON.stringify(actualTools) !== JSON.stringify(expectedTools)) {
      throw new Error("The deployed MCP server does not advertise the expected PIXIE tool set.");
    }
    for (const tool of tools) {
      if (
        tool.annotations?.readOnlyHint !== true ||
        tool.annotations?.destructiveHint !== false ||
        tool.annotations?.openWorldHint !== false ||
        !tool.inputSchema ||
        !tool.outputSchema
      ) {
        throw new Error(`The deployed tool ${tool.name} is missing its expected read-only annotations or schemas.`);
      }
    }
  } finally {
    await client.close().catch(() => {});
  }
}

const url = validateEndpoint(endpoint);
const manifest = JSON.parse(await readFile(join(packageDir, "plugin.json"), "utf8"));
const packageMetadata = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
if (manifest.version !== packageMetadata.version) {
  throw new Error("plugin.json and package.json versions must match before packaging.");
}

await verifyEndpoint(url);
const outputPath = join(outputDir, `pixie-project-companion-${manifest.version}.zip`);
const stagingDir = await mkdtemp(join(tmpdir(), "pixie-plugin-package-"));

try {
  await mkdir(outputDir, { recursive: true });
  const mcpManifest = {
    "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: {
      "pixie-project-companion": {
        type: "streamable-http",
        url,
        extensions: {
          "com.openai": {
            auth: { type: "none" },
          },
        },
      },
    },
  };
  await writeFile(join(stagingDir, "plugin.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(join(stagingDir, "mcp.json"), `${JSON.stringify(mcpManifest, null, 2)}\n`);
  await rm(outputPath, { force: true });
  execFileSync("zip", ["-q", "-j", outputPath, "plugin.json", "mcp.json"], { cwd: stagingDir });
  console.log(`Created ${outputPath}`);
} finally {
  await rm(stagingDir, { recursive: true, force: true });
}
