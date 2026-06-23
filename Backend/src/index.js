import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./auth.js";
import { loginWithEmailPassword } from "./auth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || true,
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const { token } = await loginWithEmailPassword({ email, password });
    return res.json({ token });
  } catch (err) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

const port = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Auth API listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("Failed to init DB", e);
    process.exit(1);
  });

