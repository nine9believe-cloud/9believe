import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { UPLOADS_DIR, getDb } from "@/lib/db";
import { getOrderRow } from "@/lib/orders";

const MAX_UPLOAD = 10 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic",
};

/* POST — customer submits a review for a delivered order */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = await getOrderRow(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const token = req.nextUrl.searchParams.get("t") || "";
  if (row.token !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (row.reviewed) {
    return NextResponse.json({ error: "already reviewed" }, { status: 409 });
  }

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const stars = Number(fd.get("stars"));
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "bad stars" }, { status: 400 });
  }
  const text = String(fd.get("text") || "").slice(0, 2000);

  let photoPath: string | null = null;
  const photo = fd.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_UPLOAD) {
      return NextResponse.json({ error: "รูปใหญ่เกินไป (สูงสุด 10MB)" }, { status: 400 });
    }
    const ext = IMAGE_EXT[photo.type];
    if (!ext) return NextResponse.json({ error: "รองรับเฉพาะรูปภาพ" }, { status: 400 });
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    photoPath = path.join("reviews", fileName);
    fs.writeFileSync(path.join(UPLOADS_DIR, photoPath), Buffer.from(await photo.arrayBuffer()));
  }

  const db = await getDb();
  await db.query(
    "INSERT INTO reviews (order_id, stars, text, photo_path, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, stars, text, photoPath, Date.now()]
  );
  await db.query("UPDATE orders SET reviewed = true WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
