import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

export async function loginWithEmailPassword({ email, password }) {
  const { rows } = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
    [email]
  );

  if (!rows.length) {
    // Avoid leaking which part was incorrect.
    throw new Error("Invalid credentials");
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Invalid credentials");

  const token = signAccessToken({ id: user.id, email: user.email });
  return { token };
}

export async function initDb() {
  // Create minimal users table if it doesn't exist.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Requires pgcrypto extension for gen_random_uuid().
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
}

