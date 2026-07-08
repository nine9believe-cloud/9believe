import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { withinShopHours } from "@/lib/format";

/* Shop status: open when the owner's toggle is on AND within 9:00–17:00. */

export async function GET() {
  const adminOpen = (await getSetting("shop_open", "1")) === "1";
  return NextResponse.json({ open: adminOpen && withinShopHours(), adminOpen });
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
  return NextResponse.json({ open: body.open && withinShopHours(), adminOpen: body.open });
}
