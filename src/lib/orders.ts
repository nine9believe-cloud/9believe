import { getDb } from "./db";
import { CartLine, Contact, MENU, OAT_EXTRA, OrderStatus, OrderView, SWEETS } from "./data";
import { timeStr } from "./format";

/* Order persistence + validation. Prices are always recomputed
   server-side from the canonical menu — the client total is ignored. */

type OrderRow = {
  id: string;
  token: string;
  created_at: number;
  items: CartLine[];
  total: number;
  name: string;
  phone: string;
  house: string;
  chips: string[];
  extra: string;
  status: OrderStatus;
  times: Partial<Record<OrderStatus, string>>;
  slip_path: string | null;
  reviewed: boolean;
};

export function validateItems(raw: unknown): CartLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) return null;
  const lines: CartLine[] = [];
  for (const l of raw) {
    if (typeof l !== "object" || l === null) return null;
    const item = MENU.find((m) => m.id === (l as CartLine).id);
    if (!item) return null;
    const sweet = String((l as CartLine).sweet);
    if (!(SWEETS as readonly string[]).includes(sweet)) return null;
    const oat = Boolean((l as CartLine).oat);
    if (oat && !item.milk) return null;
    const qty = Number((l as CartLine).qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return null;
    const note = String((l as CartLine).note || "").slice(0, 300);
    lines.push({
      key: [item.id, sweet, oat ? 1 : 0, note].join("|"),
      id: item.id, name: item.name, price: item.price, sweet, oat, qty, note,
    });
  }
  return lines;
}

export function validateContact(raw: unknown): Contact | null {
  if (typeof raw !== "object" || raw === null) return null;
  const c = raw as Contact;
  const name = String(c.name || "").trim().slice(0, 120);
  const phone = String(c.phone || "").replace(/[- ]/g, "");
  const house = String(c.house || "").trim().slice(0, 120);
  if (!name || !house || !/^0\d{8,9}$/.test(phone)) return null;
  const chips = Array.isArray(c.chips) ? c.chips.map((x) => String(x).slice(0, 60)).slice(0, 10) : [];
  const extra = String(c.extra || "").slice(0, 500);
  return { name, phone, house, chips, extra };
}

export const orderTotal = (items: CartLine[]) =>
  items.reduce((s, l) => s + (l.price + (l.oat ? OAT_EXTRA : 0)) * l.qty, 0);

export async function createOrder(items: CartLine[], contact: Contact, slipPath: string) {
  const db = await getDb();
  let id = "";
  for (let i = 0; i < 20; i++) {
    const candidate = String(1000 + Math.floor(Math.random() * 9000));
    const { rows } = await db.query("SELECT 1 FROM orders WHERE id = $1", [candidate]);
    if (rows.length === 0) {
      id = candidate;
      break;
    }
  }
  if (!id) id = String(Date.now()).slice(-6);
  const token = crypto.randomUUID().replace(/-/g, "");
  const now = Date.now();
  const times: Partial<Record<OrderStatus, string>> = { verify: timeStr(new Date(now)) };
  await db.query(
    `INSERT INTO orders (id, token, created_at, items, total, name, phone, house, chips, extra, status, times, slip_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'verify', $11, $12)`,
    [
      id, token, now, JSON.stringify(items), orderTotal(items),
      contact.name, contact.phone, contact.house, JSON.stringify(contact.chips), contact.extra,
      JSON.stringify(times), slipPath,
    ]
  );
  return { id, token };
}

export async function getOrderRow(id: string): Promise<OrderRow | undefined> {
  const db = await getDb();
  const { rows } = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
  return rows[0] as OrderRow | undefined;
}

export function rowToView(row: OrderRow): OrderView {
  const eta = timeStr(new Date(row.created_at + 25 * 60000));
  return {
    id: row.id,
    createdAt: row.created_at,
    items: row.items,
    total: row.total,
    contact: {
      name: row.name, phone: row.phone, house: row.house,
      chips: row.chips, extra: row.extra,
    },
    status: row.status,
    times: row.times,
    eta,
    reviewed: row.reviewed,
  };
}

export async function updateStatus(id: string, status: OrderStatus) {
  const row = await getOrderRow(id);
  if (!row) return null;
  const times = { ...row.times, [status]: timeStr(new Date()) };
  const db = await getDb();
  await db.query("UPDATE orders SET status = $1, times = $2 WHERE id = $3", [status, JSON.stringify(times), id]);
  return (await getOrderRow(id))!;
}
