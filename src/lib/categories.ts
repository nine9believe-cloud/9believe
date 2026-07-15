import crypto from "crypto";
import { getDb } from "./db";
import { Category } from "./data";

/* Menu categories: DB-backed (categories table) so the shop owner can
   add/rename/reorder/delete them from /admin instead of editing code.
   Seeded once with the original static set (matcha/thai/milk). */

const LEGACY_SEED: Category[] = [
  { id: "matcha", label: "มัจฉะ" },
  { id: "thai", label: "ชาไทย" },
  { id: "milk", label: "ชานม" },
];

async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const { rows } = await db.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM categories");
  if (rows[0].n > 0) return;
  for (let i = 0; i < LEGACY_SEED.length; i++) {
    const c = LEGACY_SEED[i];
    await db.query(
      "INSERT INTO categories (id, label, sort) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [c.id, c.label, i]
    );
  }
}

export async function listCategories(): Promise<Category[]> {
  await seedIfEmpty();
  const db = await getDb();
  const { rows } = await db.query<Category>("SELECT id, label FROM categories ORDER BY sort ASC");
  return rows;
}

export async function categoryExists(id: string): Promise<boolean> {
  await seedIfEmpty();
  const db = await getDb();
  const { rows } = await db.query("SELECT 1 FROM categories WHERE id = $1", [id]);
  return rows.length > 0;
}

export async function createCategory(label: string): Promise<Category> {
  const trimmed = label.trim().slice(0, 60);
  const db = await getDb();
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  await db.query(
    `INSERT INTO categories (id, label, sort)
     VALUES ($1, $2, COALESCE((SELECT MAX(sort) + 1 FROM categories), 0))`,
    [id, trimmed]
  );
  return { id, label: trimmed };
}

export async function renameCategory(id: string, label: string): Promise<boolean> {
  const db = await getDb();
  const { rowCount } = await db.query(
    "UPDATE categories SET label = $1 WHERE id = $2",
    [label.trim().slice(0, 60), id]
  );
  return (rowCount ?? 0) > 0;
}

export async function reorderCategories(order: string[]): Promise<void> {
  const db = await getDb();
  for (let i = 0; i < order.length; i++) {
    await db.query("UPDATE categories SET sort = $1 WHERE id = $2", [i, order[i]]);
  }
}

export async function deleteCategory(id: string): Promise<"ok" | "not_found" | "in_use"> {
  const db = await getDb();
  const { rows: used } = await db.query("SELECT 1 FROM menu_items WHERE cat = $1 LIMIT 1", [id]);
  if (used.length > 0) return "in_use";
  const { rowCount } = await db.query("DELETE FROM categories WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0 ? "ok" : "not_found";
}
