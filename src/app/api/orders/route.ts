import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getDb, getSetting } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { isAdmin } from "@/lib/auth";
import { createOrder, validateContact, validateItems } from "@/lib/orders";
import { listMenuItems } from "@/lib/menu";
import { withinShopHours } from "@/lib/format";

const MAX_UPLOAD = 10 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic",
};

/* POST — customer places an order (multipart: order JSON + slip image) */
export async function POST(req: NextRequest) {
  const open = (await getSetting("shop_open", "1")) === "1" && withinShopHours();
  if (!open) {
    return NextResponse.json({ error: "ร้านปิดอยู่ตอนนี้ · ร้านเปิด 9:00–17:00" }, { status: 409 });
  }

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "bad request" }, { status: 400 });

  let parsed: { items?: unknown; contact?: unknown };
  try {
    parsed = JSON.parse(String(fd.get("order") || "{}"));
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const menuItems = await listMenuItems();
  const items = validateItems(parsed.items, menuItems);
  const contact = validateContact(parsed.contact);
  if (!items || !contact) {
    return NextResponse.json({ error: "ข้อมูลออเดอร์ไม่ถูกต้อง" }, { status: 400 });
  }

  const slip = fd.get("slip");
  if (!(slip instanceof File) || slip.size === 0) {
    return NextResponse.json({ error: "กรุณาแนบสลิปโอนเงิน" }, { status: 400 });
  }
  if (slip.size > MAX_UPLOAD) {
    return NextResponse.json({ error: "รูปสลิปใหญ่เกินไป (สูงสุด 10MB)" }, { status: 400 });
  }
  const ext = IMAGE_EXT[slip.type];
  if (!ext) {
    return NextResponse.json({ error: "รองรับเฉพาะรูปภาพ" }, { status: 400 });
  }

  await getDb(); // ensure schema exists
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const rel = path.join("slips", fileName);
  const buf = Buffer.from(await slip.arrayBuffer());
  await uploadFile(rel, buf, slip.type);

  const { id, token } = await createOrder(items, contact, rel);
  return NextResponse.json({ id, token });
}

/* GET — admin lists all orders (newest first) */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const { rows } = await db.query<{
    id: string; created_at: number; items: unknown; total: number;
    name: string; phone: string; house: string; chips: unknown; extra: string;
    status: string; times: unknown; slip_path: string | null; reviewed: boolean;
  }>("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      items: r.items,
      total: r.total,
      contact: { name: r.name, phone: r.phone, house: r.house, chips: r.chips, extra: r.extra },
      status: r.status,
      times: r.times,
      slipUrl: r.slip_path ? `/api/admin/files/${encodeURIComponent(String(r.slip_path))}` : null,
      reviewed: Boolean(r.reviewed),
    }))
  );
}
