import { NextResponse } from "next/server";
import { listCategories } from "@/lib/categories";

/* GET — public category list for the customer app (home chips, sections) */
export async function GET() {
  const cats = await listCategories();
  return NextResponse.json(cats);
}
