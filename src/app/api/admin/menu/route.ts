import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { categoryExists } from "@/lib/categories";
import { createMenuItem, listAllMenuItemsForAdmin, MenuImageInput, MenuItemInput } from "@/lib/menu";

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

/* GET — admin lists every menu item, including hidden ones (active = false) */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const items = await listAllMenuItemsForAdmin();
  return NextResponse.json(items);
}

/* POST — admin creates a menu item (multipart: fields + optional image) */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const data = parseFields(fd);
  if (!data) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  if (!(await categoryExists(data.cat))) {
    return NextResponse.json({ error: "หมวดหมู่ไม่ถูกต้อง" }, { status: 400 });
  }

  const image = await parseImage(fd);
  if (image === null) return NextResponse.json({ error: "รูปภาพไม่ถูกต้อง (สูงสุด 10MB)" }, { status: 400 });

  const id = await createMenuItem(data, image);
  return NextResponse.json({ id });
}
