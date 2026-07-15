import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { categoryExists } from "@/lib/categories";
import { deleteMenuItem, MenuImageInput, MenuItemInput, updateMenuItem } from "@/lib/menu";

const MAX_UPLOAD = 10 * 1024 * 1024;
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic",
};

function parseFields(fd: FormData): MenuItemInput | null {
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const desc = String(fd.get("desc") || "").trim().slice(0, 500);
  const price = Number(fd.get("price"));
  const cat = String(fd.get("cat") || "");
  const milk = fd.get("milk") === "1";
  const rec = fd.get("rec") === "1";
  if (!name || !Number.isInteger(price) || price < 0 || price > 100000 || !cat) {
    return null;
  }
  return { name, desc, price, cat, milk, rec };
}

async function parseImage(fd: FormData): Promise<MenuImageInput | null | undefined> {
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > MAX_UPLOAD) return null;
  const ext = IMAGE_EXT[file.type];
  if (!ext) return null;
  return { buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type, ext };
}

/* PATCH — admin edits a menu item (multipart: fields + optional new image) */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const data = parseFields(fd);
  if (!data) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  if (!(await categoryExists(data.cat))) {
    return NextResponse.json({ error: "หมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
  }

  const image = await parseImage(fd);
  if (image === null) return NextResponse.json({ error: "รูปภาพไม่ถูกต้อง (สูงสุด 10MB)" }, { status: 400 });
  const removeImage = fd.get("removeImage") === "1";

  const ok = await updateMenuItem(id, data, image, removeImage);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/* DELETE — admin removes a menu item */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteMenuItem(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
