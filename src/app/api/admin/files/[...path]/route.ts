import { NextRequest, NextResponse } from "next/server";
import { downloadFile } from "@/lib/storage";
import { isAdmin } from "@/lib/auth";

/* GET — serve uploaded files (slips, review photos) to the shop owner only */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { path: parts } = await ctx.params;
  const rel = parts.map(decodeURIComponent).join("/");
  if (rel.includes("..")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const file = await downloadFile(rel);
  if (!file) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "private, max-age=3600" },
  });
}
