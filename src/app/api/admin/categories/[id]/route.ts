import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteCategory, renameCategory } from "@/lib/categories";

/* PATCH — admin renames a category */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const label = String(body.label || "").trim();
  if (!label) return NextResponse.json({ error: "กรอกชื่อหมวดหมู่" }, { status: 400 });
  const ok = await renameCategory(id, label);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/* DELETE — admin removes a category (blocked if any menu item still uses it) */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await deleteCategory(id);
  if (result === "not_found") return NextResponse.json({ error: "not found" }, { status: 404 });
  if (result === "in_use") {
    return NextResponse.json({ error: "มีเมนูใช้หมวดหมู่นี้อยู่ ย้ายเมนูออกก่อนลบ" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
