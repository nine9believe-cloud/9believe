import crypto from "crypto";
import { getDb } from "./db";
import { deleteFile, uploadFile } from "./storage";
import { MenuItem } from "./data";

/* Menu items: DB-backed (menu_items table) so the shop owner can manage
   the drink catalogue (image/name/desc/price/category) from /admin
   instead of editing code. The table already existed in the database
   (id, name, description, price, cat, milk, rec, image_url, sort, active)
   seeded with the original static catalogue — this module reads/writes
   that exact shape. `active` lets the owner hide an item without deleting it. */

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  cat: string;
  milk: boolean;
  rec: boolean;
  image_url: string | null;
  sort: number;
  active: boolean;
};

export type AdminMenuItem = MenuItem & { active: boolean };

const LEGACY_SEED: Omit<MenuItem, "image">[] = [
  { id: "matcha-latte", name: "มัจฉะลาเต้", price: 70, cat: "matcha", milk: true, rec: true,
    desc: "มัจฉะเข้มข้นกับนมสดหอมมัน ตีสดแก้วต่อแก้ว" },
  { id: "pure-matcha", name: "เพียวมัจฉะ", price: 60, cat: "matcha", milk: false, rec: true,
    desc: "มัจฉะล้วนตีด้วยฉะเซ็น หอมกลิ่นชาเขียวเต็มแก้ว" },
  { id: "matcha-coconut", name: "มัจฉะมะพร้าว", price: 70, cat: "matcha", milk: false, rec: false,
    desc: "มัจฉะกับน้ำมะพร้าวหอม สดชื่นกำลังดี" },
  { id: "hojicha", name: "โฮจิฉะ", price: 70, cat: "matcha", milk: true, rec: false,
    desc: "ชาคั่วหอมกรุ่น อบอุ่นละมุนเข้ากับนม" },
  { id: "thai-tea", name: "ชาไทยไม่ใส่สี", price: 70, cat: "thai", milk: true, rec: true,
    desc: "ชาไทยรสเข้ม ไม่ใส่สี ไม่แต่งกลิ่น" },
  { id: "million-mile", name: "ชานมหอมหมื่นลี้", price: 60, cat: "milk", milk: true, rec: false,
    desc: "ชานมกลิ่นหอมลอยไกล หวานมันกำลังดี" },
];

function imageUrl(id: string, imagePath: string | null): string {
  return imagePath ? `/api/menu/files/${encodeURIComponent(imagePath)}` : `/images/menu/${id}.webp`;
}

function toMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    desc: row.description,
    price: row.price,
    cat: row.cat as MenuItem["cat"],
    milk: row.milk,
    rec: row.rec,
    image: imageUrl(row.id, row.image_url),
  };
}

function toAdminMenuItem(row: MenuItemRow): AdminMenuItem {
  return { ...toMenuItem(row), active: row.active };
}

async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const { rows } = await db.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM menu_items");
  if (rows[0].n > 0) return;
  for (let i = 0; i < LEGACY_SEED.length; i++) {
    const m = LEGACY_SEED[i];
    await db.query(
      `INSERT INTO menu_items (id, name, description, price, cat, milk, rec, image_url, sort, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, true)
       ON CONFLICT (id) DO NOTHING`,
      [m.id, m.name, m.desc, m.price, m.cat, m.milk, m.rec, i + 1]
    );
  }
}

export async function listMenuItems(): Promise<MenuItem[]> {
  await seedIfEmpty();
  const db = await getDb();
  const { rows } = await db.query<MenuItemRow>(
    "SELECT * FROM menu_items WHERE active = true ORDER BY sort ASC, name ASC"
  );
  return rows.map(toMenuItem);
}

export async function listAllMenuItemsForAdmin(): Promise<AdminMenuItem[]> {
  await seedIfEmpty();
  const db = await getDb();
  const { rows } = await db.query<MenuItemRow>(
    "SELECT * FROM menu_items ORDER BY sort ASC, name ASC"
  );
  return rows.map(toAdminMenuItem);
}

export type MenuItemInput = {
  name: string;
  desc: string;
  price: number;
  cat: string;
  milk: boolean;
  rec: boolean;
};

export type MenuImageInput = { buffer: Buffer; contentType: string; ext: string };

export async function createMenuItem(data: MenuItemInput, image?: MenuImageInput): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  let imagePath: string | null = null;
  if (image) {
    imagePath = `menu/${id}-${Date.now()}.${image.ext}`;
    await uploadFile(imagePath, image.buffer, image.contentType);
  }
  await db.query(
    `INSERT INTO menu_items (id, name, description, price, cat, milk, rec, image_url, sort, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
       COALESCE((SELECT MAX(sort) + 1 FROM menu_items), 0), true)`,
    [id, data.name, data.desc, data.price, data.cat, data.milk, data.rec, imagePath]
  );
  return id;
}

export async function updateMenuItem(
  id: string,
  data: MenuItemInput,
  image?: MenuImageInput,
  removeImage?: boolean
): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ image_url: string | null }>(
    "SELECT image_url FROM menu_items WHERE id = $1",
    [id]
  );
  if (!rows[0]) return false;

  let imagePath = rows[0].image_url;
  if (image) {
    if (imagePath) await deleteFile(imagePath).catch(() => {});
    imagePath = `menu/${id}-${Date.now()}.${image.ext}`;
    await uploadFile(imagePath, image.buffer, image.contentType);
  } else if (removeImage && imagePath) {
    await deleteFile(imagePath).catch(() => {});
    imagePath = null;
  }

  await db.query(
    `UPDATE menu_items
     SET name = $1, description = $2, price = $3, cat = $4, milk = $5, rec = $6, image_url = $7
     WHERE id = $8`,
    [data.name, data.desc, data.price, data.cat, data.milk, data.rec, imagePath, id]
  );
  return true;
}

export async function setMenuItemActive(id: string, active: boolean): Promise<boolean> {
  const db = await getDb();
  const { rowCount } = await db.query("UPDATE menu_items SET active = $1 WHERE id = $2", [active, id]);
  return (rowCount ?? 0) > 0;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ image_url: string | null }>(
    "SELECT image_url FROM menu_items WHERE id = $1",
    [id]
  );
  if (!rows[0]) return false;
  await db.query("DELETE FROM menu_items WHERE id = $1", [id]);
  if (rows[0].image_url) await deleteFile(rows[0].image_url).catch(() => {});
  return true;
}
