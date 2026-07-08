import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

/* GET — shop owner lists customer reviews (newest first) */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const { rows } = await db.query<{
    id: number; order_id: string; stars: number; text: string; photo_path: string | null; created_at: number;
  }>("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 200");
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      stars: r.stars,
      text: r.text,
      photoUrl: r.photo_path ? `/api/admin/files/${encodeURIComponent(r.photo_path)}` : null,
      createdAt: r.created_at,
    }))
  );
}
