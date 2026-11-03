import http from "node:http";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { CATALOG_CAPTURED_AT, PIXIE_SURFACES, PROJECTS } from "./catalog.mjs";
import {
  CATEGORY_VALUES,
  INTENT_VALUES,
  MATURITY_VALUES,
  STATUS_VALUES,
  SNAPSHOT_NOTE,
  getEcosystemEntry,
  getStatusDefinitions,
  listPixieSurfaces,
  searchEcosystem,
  suggestPath,
} from "./catalog-tools.js";

const statusSchema = z.enum(STATUS_VALUES);
const linkSchema = z.object({ label: z.string(), url: z.string().url() });
const capabilitySchema = z.object({
  status: statusSchema,
  label: z.string(),
  note: z.string().nullable(),
});
const entrySchema = z.object({
  kind: z.enum(["project", "pixie_surface"]),
  id: z.string(),
  name: z.string(),
  category: z.string(),
  categoryLabel: z.string(),
  maturity: z.string(),
  maturityGroups: z.array(z.string()),
  summary: z.string(),
  role: z.string(),
  boundary: z.string().nullable(),
  capabilities: z.array(capabilitySchema),
  links: z.array(linkSchema),
});
const statusDefinitionsSchema = z.object({
  implemented: z.string(),
  simulated: z.string(),
  planned: z.string(),
  unverified: z.string(),
});
const snapshotFields = {
  capturedAt: z.string(),
  snapshotNote: z.string(),
};
const pageFields = {
  total: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(20),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
};
const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

export function createPixieMcpServer() {
  const server = new McpServer(
    { name: "pixie-project-companion", version: "0.1.0" },
    {
      instructions:
        "You are PIXIE Project Companion, a read-only guide to a curated public snapshot of Loptr Lab projects and distinct PIXIE surfaces. Use source links when current facts matter; the snapshot is not live verification. Explain implemented, simulated, planned, and unverified status accurately. Do not claim shared runtime, cross-project access, identity, or integrations unless a linked source establishes them. Offer options and let the user choose. You cannot change repositories, publish, contact people, access private data, or take actions.",
    },
  );

  server.registerTool(
    "search_ecosystem",
    {
      title: "Search the Loptr Lab ecosystem",
      description:
        "Search the bundled, source-linked snapshot of Loptr Lab projects and PIXIE surfaces by topic, category, maturity group, or capability status. Use when someone wants to discover or compare public project information. Results are a dated snapshot, not live website or deployment checks.",
      inputSchema: {
        query: z.string().trim().max(120).optional().describe("Optional topic or keyword. Leave empty to browse the selected scope."),
        scope: z.enum(["all", "projects", "pixie_surfaces"]).default("all").describe("Which catalog records to search."),
        category: z.enum(CATEGORY_VALUES).optional().describe("Optional project category; PIXIE surfaces are in the pixie category."),
        maturity_group: z.enum(MATURITY_VALUES).optional().describe("Optional maturity facet such as early, prototype, local, or proposal."),
        status: statusSchema.optional().describe("Optional capability status: implemented, simulated, planned, or unverified."),
        limit: z.number().int().min(1).max(20).default(10).describe("Maximum results to return."),
        offset: z.number().int().min(0).max(100).default(0).describe("Result offset for paging through matching records."),
      },
      outputSchema: z.object({
        entries: z.array(entrySchema),
        ...pageFields,
        ...snapshotFields,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args) => {
      const result = searchEcosystem(args);
      const text = result.entries.length
        ? `Found ${result.entries.length} of ${result.total} matching catalog entries. ${result.snapshotNote}`
        : `No matching entries in the curated catalog. ${result.snapshotNote}`;
      return {
        content: [{ type: "text", text }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "get_ecosystem_entry",
    {
      title: "Read a project or PIXIE surface",
      description:
        "Return the full catalog record, maturity, capability statuses, boundaries, and source links for a known project or PIXIE surface ID. Use after search_ecosystem or list_pixie_surfaces. Unknown IDs return found=false rather than guessing.",
      inputSchema: {
        id: z.string().trim().min(1).max(80).describe("Exact catalog ID returned by a search or surface listing."),
      },
      outputSchema: z.object({
        found: z.boolean(),
        entry: entrySchema.nullable(),
        statusDefinitions: statusDefinitionsSchema,
        ...snapshotFields,
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ id }) => {
      const entry = getEcosystemEntry(id);
      const result = {
        found: Boolean(entry),
        entry,
        statusDefinitions: getStatusDefinitions(),
        capturedAt: CATALOG_CAPTURED_AT,
        snapshotNote: SNAPSHOT_NOTE,
      };
      return {
        content: [{
          type: "text",
          text: entry
            ? `Loaded ${entry.name} (${entry.kind}). ${SNAPSHOT_NOTE}`
            : `No catalog record has the exact ID ${id}. Search the catalog for valid IDs. ${SNAPSHOT_NOTE}`,
        }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "list_pixie_surfaces",
    {
      title: "List distinct PIXIE surfaces",
      description:
        "Browse or filter the separately scoped PIXIE iterations in the catalog. Use when someone asks how PIXIE differs across projects. Each result includes its own role, maturity, capabilities, boundary, and source links; shared runtime is not implied.",
      inputSchema: {
        query: z.string().trim().max(120).optional().describe("Optional topic or keyword."),
        maturity_group: z.enum(MATURITY_VALUES).optional().describe("Optional maturity facet."),
        status: statusSchema.optional().describe("Optional capability status."),
        limit: z.number().int().min(1).max(20).default(10).describe("Maximum results to return."),
        offset: z.number().int().min(0).max(100).default(0).describe("Result offset for paging."),
      },
      outputSchema: z.object({
        surfaces: z.array(entrySchema),
        ...pageFields,
        ...snapshotFields,
      }),
      annotations: readOnlyAnnotations,
    },
    async (args) => {
      const result = listPixieSurfaces(args);
      const text = `Found ${result.surfaces.length} of ${result.total} matching PIXIE surfaces. ${result.snapshotNote}`;
      return {
        content: [{ type: "text", text }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "suggest_ecosystem_path",
    {
      title: "Suggest an ecosystem starting path",
      description:
        "Return a bounded, source-linked set of public starting points for play, creating, discovery, contribution, or comparing PIXIE iterations. This is guidance only; it does not contact projects or create repository changes.",
      inputSchema: {
        intent: z.enum(INTENT_VALUES).describe("The visitor's chosen interest: play, create, discover, contribute, or pixie."),
      },
      outputSchema: z.object({
        intent: z.enum(INTENT_VALUES),
        title: z.string(),
        guidance: z.string(),
        entries: z.array(entrySchema),
        ...snapshotFields,
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ intent }) => {
      const result = suggestPath(intent);
      return {
        content: [{ type: "text", text: `${result.title}. ${result.guidance} ${result.snapshotNote}` }],
        structuredContent: result,
      };
    },
  );

  return server;
}

async function readJsonBody(request, maxBytes) {
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const error = new Error("Content-Type must be application/json.");
    error.statusCode = 415;
    throw error;
  }

  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > maxBytes) {
    const error = new Error("Request body is too large.");
    error.statusCode = 413;
    throw error;
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function sendJson(response, statusCode, value, headOnly = false) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(headOnly ? undefined : body);
}

export function createHttpServer({ maxBodyBytes = 64 * 1024 } = {}) {
  return http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const pathname = requestUrl.pathname;

    if ((request.method === "GET" || request.method === "HEAD") && pathname === "/healthz") {
      return sendJson(response, 200, {
        status: "ok",
        plugin: "pixie-project-companion",
        catalogCapturedAt: CATALOG_CAPTURED_AT,
        projectCount: PROJECTS.length,
        pixieSurfaceCount: PIXIE_SURFACES.length,
      }, request.method === "HEAD");
    }

    if ((request.method === "GET" || request.method === "HEAD") && pathname === "/") {
      return sendJson(response, 200, {
        name: "PIXIE Project Companion",
        description: "Read-only, source-linked information about Loptr Lab projects and distinct PIXIE surfaces.",
        mcpEndpoint: "/mcp",
        capturedAt: CATALOG_CAPTURED_AT,
        scope: SNAPSHOT_NOTE,
      }, request.method === "HEAD");
    }

    if (pathname !== "/mcp") {
      return sendJson(response, 404, { error: "Not found." });
    }

    if (!["POST", "GET", "DELETE"].includes(request.method ?? "")) {
      response.setHeader("allow", "POST, GET, DELETE");
      return sendJson(response, 405, { error: "Method not allowed." });
    }

    let body;
    try {
      if (request.method === "POST") body = await readJsonBody(request, maxBodyBytes);
    } catch (error) {
      return sendJson(response, error.statusCode ?? 400, { error: error.message });
    }

    const mcpServer = createPixieMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(request, response, body);
    } catch (error) {
      // Never log request bodies or user-provided search terms.
      console.error("PIXIE MCP request failed:", error?.name ?? "Error");
      if (!response.headersSent) sendJson(response, 500, { error: "The MCP request could not be completed." });
      else if (!response.writableEnded) response.end();
    } finally {
      await mcpServer.close().catch(() => {});
    }
  });
}

export function startServer({ port = Number(process.env.PORT ?? 8080), host = "0.0.0.0" } = {}) {
  const server = createHttpServer();
  return new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      console.log(`PIXIE Project Companion listening on ${host}:${port}`);
      resolveListen(server);
    });
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  startServer().catch((error) => {
    console.error("PIXIE MCP server failed to start:", error?.name ?? "Error");
    process.exitCode = 1;
  });
}
