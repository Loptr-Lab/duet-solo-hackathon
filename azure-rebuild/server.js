import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Prefer managed identity/passwordless authentication when the selected
    // Azure PostgreSQL configuration supports it; do not log credentials.
    connectionTimeoutMillis: 3000,
    max: 5
  });
}

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/readyz", async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      status: "not_ready",
      reason: "database_not_configured"
    });
  }

  try {
    await pool.query("SELECT 1");
    return res.status(200).json({ status: "ready" });
  } catch {
    // Deliberately omit driver errors and connection details from responses.
    return res.status(503).json({ status: "not_ready" });
  }
});

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "duet-azure-rebuild",
    status: "scaffold",
    playable: false
  });
});

const port = Number.parseInt(process.env.PORT ?? "8080", 10);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Duet rebuild scaffold listening on port ${port}`);
  });
}

export { app };
