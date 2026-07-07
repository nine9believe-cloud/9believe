import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(path.join(UPLOADS_DIR, "slips"), { recursive: true });
  fs.mkdirSync(path.join(UPLOADS_DIR, "reviews"), { recursive: true });
  db = new Database(path.join(DATA_DIR, "app.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house TEXT NOT NULL,
      chips TEXT NOT NULL DEFAULT '[]',
      extra TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'verify',
      times TEXT NOT NULL DEFAULT '{}',
      slip_path TEXT,
      reviewed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      stars INTEGER NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      photo_path TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return db;
}

export function getSetting(key: string, fallback: string): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : fallback;
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, value);
}
