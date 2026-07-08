import { NextResponse } from "next/server";
import { listMenuItems } from "@/lib/menu";

/* GET — public menu catalogue for the customer app (home, search, cart) */
export async function GET() {
  const items = await listMenuItems();
  return NextResponse.json(items);
}
