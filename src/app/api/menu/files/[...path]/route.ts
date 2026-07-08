import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/lib/storage";

/* GET — public serving of uploaded menu photos (product images shown to
   customers, unlike slips/reviews these aren't sensitive). Restricted to
   the "menu/" prefix so this route can't be used to read other uploads. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const rel = parts.map(decodeURIComponent).join("/");
  if (rel.includes("..") || !rel.startsWith("menu/")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const file = await downloadFile(rel);
  if (!file) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=3600" },
  });
}
