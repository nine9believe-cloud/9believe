import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createCategory, listCategories, reorderCategories } from "@/lib/categories";

/* GET — admin category list */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listCategories());
}

/* POST — admin creates a category */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const label = String(body.label || "").trim();
  if (!label) return NextResponse.json({ error: "กรอกชื่อหมวดหมู่" }, { status: 400 });
  const cat = await createCategory(label);
  return NextResponse.json(cat);
}

/* PATCH — admin reorders categories (body: { order: string[] } of ids) */
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body.order) || body.order.some((x: unknown) => typeof x !== "string")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await reorderCategories(body.order);
  return NextResponse.json({ ok: true });
}
