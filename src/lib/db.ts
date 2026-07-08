import { Pool, types } from "pg";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

/* BIGINT columns (created_at, reviews.id) come back from pg as strings by
   default to avoid precision loss above 2^53. Our timestamps/ids never get
   that large, so parse them to numbers to match the previous sqlite shape. */
types.setTypeParser(20, (val) => parseInt(val, 10));

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function connectionString(): string {
  const url = process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error("POSTGRES_URL_NON_POOLING is not set");
  // Supabase's sslmode=require query param maps to libpq's verify-full via
  // pg-connection-string, which fails without the CA chain. We terminate
  // TLS without verifying the chain instead, via the ssl option below.
  return url.replace(/[?&]sslmode=[^&]+/, "");
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: connectionString(), ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

async function ensureSchema(): Promise<void> {
  fs.mkdirSync(path.join(UPLOADS_DIR, "slips"), { recursive: true });
  fs.mkdirSync(path.join(UPLOADS_DIR, "reviews"), { recursive: true });
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      items JSONB NOT NULL,
      total INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house TEXT NOT NULL,
      chips JSONB NOT NULL DEFAULT '[]',
      extra TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'verify',
      times JSONB NOT NULL DEFAULT '{}',
      slip_path TEXT,
      reviewed BOOLEAN NOT NULL DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      order_id TEXT NOT NULL,
      stars INTEGER NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      photo_path TEXT,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function getDb(): Promise<Pool> {
  if (!schemaReady) schemaReady = ensureSchema();
  await schemaReady;
  return getPool();
}

export async function getSetting(key: string, fallback: string): Promise<string> {
  const db = await getDb();
  const { rows } = await db.query<{ value: string }>("SELECT value FROM settings WHERE key = $1", [key]);
  return rows[0]?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.query(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
    [key, value]
  );
}
