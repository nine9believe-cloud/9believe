import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".heic": "image/heic",
};

/* GET — serve uploaded files (slips, review photos) to the shop owner only */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { path: parts } = await ctx.params;
  const rel = parts.map(decodeURIComponent).join("/");
  const abs = path.resolve(UPLOADS_DIR, rel);
  if (!abs.startsWith(path.resolve(UPLOADS_DIR) + path.sep) || !fs.existsSync(abs)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const buf = fs.readFileSync(abs);
  const type = MIME[path.extname(abs).toLowerCase()] || "application/octet-stream";
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" } });
}
