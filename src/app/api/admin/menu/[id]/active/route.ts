import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setMenuItemActive } from "@/lib/menu";

/* PATCH — admin shows/hides a menu item without deleting it */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const ok = await setMenuItemActive(id, body.active);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
