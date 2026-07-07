import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

/* GET — is the current browser signed in as the shop owner? */
export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}
