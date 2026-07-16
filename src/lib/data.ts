/* Shared domain data — menu, categories, order steps. */

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  cat: string;
  milk: boolean;
  rec: boolean;
  desc: string;
  image: string;
};

/* Categories are admin-managed (CRUD via /admin) and DB-backed — see
   lib/categories.ts. "rec" isn't a real category: it's a pseudo-filter
   for items flagged `rec`, always pinned first in the chip row. */
export type Category = { id: string; label: string };
export const REC_FILTER: Category = { id: "rec", label: "แนะนำ" };

export const SWEETS = ["ไม่หวาน", "หวานน้อย", "หวานปกติ"] as const;
export const OAT_EXTRA = 10;

export type OrderStatus = "verify" | "brewing" | "prepare" | "deliver" | "done";

export const STEPS: { id: OrderStatus; label: string; icon: string; msg: string }[] = [
  { id: "verify", label: "ตรวจสอบการชำระเงิน", icon: "search-01",
    msg: "ระบบกำลังตรวจสอบยอดเงินอัตโนมัติ แป๊บเดียวเสร็จ" },
  { id: "brewing", label: "กำลังชง", icon: "coffee-02",
    msg: "กำลังตีมัจฉะและชงเครื่องดื่มของคุณอย่างใส่ใจ" },
  { id: "prepare", label: "เตรียมจัดส่ง", icon: "shopping-bag-01",
    msg: "แพ็กใส่ถุงพร้อมน้ำแข็ง กันหกอย่างดี" },
  { id: "deliver", label: "กำลังจัดส่ง", icon: "delivery-truck-01",
    msg: "เจ้าของร้านกำลังเดินไปส่งถึงหน้าบ้านคุณ" },
  { id: "done", label: "จัดส่งสำเร็จ", icon: "checkmark-circle-02",
    msg: "ส่งถึงแล้ว ขอบคุณที่อุดหนุนกัน" },
];

export const STATUS_ORDER: OrderStatus[] = ["verify", "brewing", "prepare", "deliver", "done"];

export const NOTE_CHIPS = ["ไม่ต้องกดกริ่ง", "วางหน้าบ้าน", "ถึงแล้วเรียกได้"];

/* ---- Cart / order line ---- */

export type CartLine = {
  key: string;
  id: string;
  name: string;
  price: number;
  image: string;
  sweet: string;
  oat: boolean;
  qty: number;
  note: string;
};

export type Contact = {
  name: string;
  phone: string;
  soi: string;
  house: string;
  chips: string[];
  extra: string;
};

export type OrderView = {
  id: string;
  createdAt: number;
  items: CartLine[];
  total: number;
  contact: Contact;
  status: OrderStatus;
  times: Partial<Record<OrderStatus, string>>;
  eta: string;
  reviewed: boolean;
};
