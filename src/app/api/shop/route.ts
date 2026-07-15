import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

/* Shop status: open purely by the owner's manual toggle — no fixed hours. */

export async function GET() {
  const adminOpen = (await getSetting("shop_open", "1")) === "1";
  return NextResponse.json({ open: adminOpen, adminOpen });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (typeof body.open !== "boolean") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await setSetting("shop_open", body.open ? "1" : "0");
  return NextResponse.json({ open: body.open, adminOpen: body.open });
}
