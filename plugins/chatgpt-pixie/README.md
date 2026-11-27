# PIXIE Project Companion — ChatGPT MCP server

A separate, read-only ChatGPT integration for navigating the Loptr Lab ecosystem. It complements the public PIXIE workspace; it does not replace it, embed into ecosystem.loptrlab.com, or provide control across the ecosystem.

## Current scope

The server exposes four tools: `search_ecosystem`, `get_ecosystem_entry`, `list_pixie_surfaces`, and `suggest_ecosystem_path`. They query a bundled catalog snapshot prepared on 2026-10-14. Results include public source links and separate role, maturity, capability-status, and boundary fields. The server does not fetch live sites, inspect deployments, authenticate to project accounts, read private data, modify repositories, submit feedback, contact people, or persist tool inputs. Suggestions leave the next action with the user.

The catalog contains all listed ecosystem project records and the distinct PIXIE iterations represented in the reviewed public source set. `implemented`, `simulated`, `planned`, and `unverified` keep source status separate from production status. A linked page should be checked for current facts; a source link is not proof that a destination is live or that a deployment matches a repository.

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
npm run check
npm test
npm start
```

The service listens on `0.0.0.0:$PORT` (`8080` by default). Its MCP endpoint is `/mcp` using Streamable HTTP; the unauthenticated health endpoint is `GET /healthz`. No API keys or environment secrets are required.

To inspect the endpoint with MCP Inspector, start the server and connect Inspector to `http://localhost:8080/mcp` using Streamable HTTP. The automated test suite uses the official MCP SDK client to initialize the server, inspect tool schemas and annotations, and exercise representative and invalid calls. [`test/chatgpt-evaluation-cases.md`](test/chatgpt-evaluation-cases.md) records five positive and three boundary cases for later testing in ChatGPT.

## Deploy and connect

`Dockerfile` builds this subdirectory as a separate container service. For a Cloud Run deployment, use `GET /healthz` as the health path and configure the published service to route public HTTPS traffic to the container. This repository change does **not** deploy the service, configure DNS, or change the existing DUET deployment.

After a stable HTTPS endpoint exists, connect it in ChatGPT through **Plugins → Add custom MCP server** and use the endpoint ending in `/mcp`. `mcp.json.example` illustrates the portable connection shape. Do not upload the example as a working package: replace its placeholder URL with the deployed endpoint first. The ChatGPT connection, domain verification, plugin scan, developer verification, and publication review remain separate owner actions.

## Public-directory readiness

The source server and local plugin identity are an implementation, not a ready-to-install or published ChatGPT app. Before public submission, the owner still needs to choose and configure a stable public HTTPS host, verify publisher/domain identity, provide a published privacy policy and support/terms destinations as required, add approved listing artwork and release details, connect and scan the hosted server, review tool-selection behavior, and submit the plugin for OpenAI's checks and approval. The current private ChatGPT app settings have not been changed.

The server handles only public catalog fields and logs no request body or search text in application code. Hosting providers and the ChatGPT service may process their normal operational metadata under their own policies; deployment-specific retention must be reviewed before publishing a privacy statement.

## Package metadata

`plugin.json` contains draft portable plugin identity and example prompts. It does not by itself register a server in ChatGPT. `mcp.json.example` is a template, not a configured endpoint. After choosing a stable endpoint, set `PIXIE_MCP_URL` to its HTTPS `/mcp` URL and run `npm run package`. The command first checks `/healthz`, connects over Streamable HTTP, and verifies the advertised read-only tools before creating the ZIP. It refuses local or placeholder endpoints. Final policy/listing URLs still need owner review.

## Maintainer references

- [OpenAI: Build an MCP server](https://developers.openai.com/plugins/build/mcp-server)
- [OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [OpenAI: Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- [OpenAI: Submit and publish](https://developers.openai.com/plugins/deploy/submission)
- [OpenAI: Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines)
