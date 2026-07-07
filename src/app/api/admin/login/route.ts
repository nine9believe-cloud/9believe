import { NextRequest, NextResponse } from "next/server";
import { adminToken, checkPin } from "@/lib/auth";

/* POST — shop owner signs in with the PIN; sets the admin cookie */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!checkPin(String(body.pin || ""))) {
    return NextResponse.json({ error: "รหัส PIN ไม่ถูกต้อง" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("9b_admin", adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

/* DELETE — sign out */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("9b_admin", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
