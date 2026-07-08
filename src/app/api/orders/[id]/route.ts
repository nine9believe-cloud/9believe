import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getOrderRow, rowToView, updateStatus } from "@/lib/orders";
import { STATUS_ORDER, OrderStatus } from "@/lib/data";

/* GET — customer polls order status (requires the order token) */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const row = await getOrderRow(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const token = req.nextUrl.searchParams.get("t") || "";
  if (row.token !== token && !(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(rowToView(row));
}

/* PATCH — shop owner updates the order status */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as OrderStatus;
  if (!STATUS_ORDER.includes(status)) {
    return NextResponse.json({ error: "bad status" }, { status: 400 });
  }
  const row = await updateStatus(id, status);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rowToView(row));
}
