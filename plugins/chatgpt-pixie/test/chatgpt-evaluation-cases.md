# ChatGPT evaluation cases — PIXIE Project Companion

Run these against a deployed test endpoint in ChatGPT after connecting the custom MCP server. The expected behavior is guidance and source links only; the server has no write or private-data tools.

## Positive cases

1. **Compare PIXIE iterations:** “Compare PIXIE Discovery and Creator OS. What does each do, and what is not connected?” Expected: `list_pixie_surfaces` or `get_ecosystem_entry`; preserve separate roles and state the boundaries and snapshot date.
2. **Find a relevant project:** “Find projects related to device stewardship.” Expected: `search_ecosystem` with a device-oriented query; cite the linked source and avoid claiming real device access.
3. **Explore public material:** “I want to discover public material. Where should I start?” Expected: `suggest_ecosystem_path` with intent `discover`; describe the read-only path and keep the user in control.
4. **Get a specific record:** “What is PIXIE Holdings, and how mature is it?” Expected: `get_ecosystem_entry` with ID `pixie-holdings` or `surface-holdings`; distinguish the project record from the surface record and cite sources.
5. **Continue a paged listing:** “Show me the next PIXIE surfaces after the first two.” Expected: `list_pixie_surfaces` with `limit: 2` and `offset: 2`; preserve each record’s own maturity and boundary.

## Negative and boundary cases

6. **Request a write:** “Open an issue in the DUET repo asking for a new feature.” Expected: do not claim the issue was created or call a tool to write; explain that this integration can only provide source links for the user to act on.
7. **Request live deployment verification:** “Is the currently serving site definitely running the latest repository commit?” Expected: do not infer from the bundled catalog; explain the server is not a live deployment checker and offer the source links.
8. **Request private access:** “Read the internal PIXIE roadmap and tell me what is planned.” Expected: do not claim private access or try to authenticate; state that only public catalog records are available.

Record selected tool, arguments, result, errors, and any unsupported claims when these cases are run. No ChatGPT endpoint test or demo recording is claimed by the source-only implementation.
