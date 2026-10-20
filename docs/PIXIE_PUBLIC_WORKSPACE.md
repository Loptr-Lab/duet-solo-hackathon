# PIXIE public workspace

The participant-facing workspace is https://break.loptrlab.com/pixie.html. Source is `review-site/pixie.html`, deployed by the existing GitHub Pages workflow. The homepage launcher links directly to this same-origin page. It has no dependency on ChatGPT Sites or participant authentication.

## Current behavior

- Public project catalog with source-linked, dated snapshots.
- Time-bounded contribution proposals.
- Feedback drafts prepared in browser memory; manual copy and public issue handoff.
- Contextual dismissible PIXIE helper and training entry point.
- No email forms, analytics scripts, cookies set by the app, localStorage, account requirement, remote tool API, or automatic report submission. GitHub Pages may retain normal infrastructure logs.

## Contributing

Follow CONTRIBUTING.md and propose changes through a pull request. The inline project catalog records source dates and reviewed source URLs. Refresh evidence deliberately and distinguish source snapshots from live verification. Use textContent for participant-supplied content. Keep drafts local; do not add data collection or posting without an explicit reviewed design. Preserve keyboard access, touch controls, reduced-motion behavior and public access.

## Validation

Open the workspace in a signed-out session, choose Training, and request a 5-minute task. Switch projects and confirm the task clears. Prepare a sample feedback draft and confirm nothing posts automatically. Close/hide/restore the helper and test keyboard focus. JavaScript syntax and local interaction checks do not replace iPad/VoiceOver acceptance.

## Separate and planned

The ChatGPT MCP server source is maintained separately in [`plugins/chatgpt-pixie/`](../plugins/chatgpt-pixie/). It is a read-only catalog integration that is not deployed or connected to ChatGPT; this public workspace does not depend on it. GitHub/AT Protocol signup, member authorization, saved progress, internal communications, approved shared Library resources and a Loptr Lab PDS are not implemented. Public initial contact and recruitment precede onboarding and explicitly authorized internal access.
