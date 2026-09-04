# Security Policy

Do not report vulnerabilities through public issues when disclosure could expose credentials,
player tokens, private data, or a deployed service.

For Loptr Lab's repository, email security@loptrlab.com or use a private GitHub security
advisory if enabled. Operators of fan forks must publish their own security contact.

## Deployment warnings

- A public `/api/agent` endpoint spends the operator's Gemini quota. Keep the included rate
  limit enabled and add an upstream Cloud Run/API Gateway budget or quota control.
- Never commit `.env`, service-account JSON, application passwords, or cloud credentials.
- Use a dedicated Bluesky app password, not an account password, and rotate it after exposure.
- Restrict Firestore service-account permissions and configure retention before public use.
- Do not connect a fan fork to Loptr Lab production projects, accounts, or data.
