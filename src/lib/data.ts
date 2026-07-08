/* Shared domain data — menu, categories, order steps.
   Copy is verbatim from the approved Claude Design prototype. */

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  cat: "matcha" | "thai" | "milk";
  milk: boolean;
  rec: boolean;
  desc: string;
};

export const CATS = [
  { id: "rec", label: "แนะนำ" },
  { id: "matcha", label: "มัจฉะ" },
  { id: "thai", label: "ชาไทย" },
  { id: "milk", label: "ชานม" },
] as const;

export const CAT_LABEL: Record<string, string> = {
  matcha: "มัจฉะ",
  thai: "ชาไทย",
  milk: "ชานม",
};

export const MENU: MenuItem[] = [
  { id: "matcha-latte", name: "มัจฉะลาเต้", price: 70, cat: "matcha", milk: true, rec: true,
    desc: "มัจฉะเข้มข้นกับนมสดหอมมัน ตีสดแก้วต่อแก้ว" },
  { id: "pure-matcha", name: "เพียวมัจฉะ", price: 60, cat: "matcha", milk: false, rec: true,
    desc: "มัจฉะล้วนตีด้วยฉะเซ็น หอมกลิ่นชาเขียวเต็มแก้ว" },
  { id: "matcha-coconut", name: "มัจฉะมะพร้าว", price: 70, cat: "matcha", milk: false, rec: false,
    desc: "มัจฉะกับน้ำมะพร้าวหอม สดชื่นกำลังดี" },
  { id: "hojicha", name: "โฮจิฉะ", price: 70, cat: "matcha", milk: true, rec: false,
    desc: "ชาคั่วหอมกรุ่น อบอุ่นละมุนเข้ากับนม" },
  { id: "thai-tea", name: "ชาไทยไม่ใส่สี", price: 70, cat: "thai", milk: true, rec: true,
    desc: "ชาไทยรสเข้ม ไม่ใส่สี ไม่แต่งกลิ่น" },
  { id: "million-mile", name: "ชานมหอมหมื่นลี้", price: 60, cat: "milk", milk: true, rec: false,
    desc: "ชานมกลิ่นหอมลอยไกล หวานมันกำลังดี" },
];

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

export const NOTE_CHIPS = ["ไม่ต้องกดกริ่ง", "วางหน้าบ้าน", "โทรก่อนส่ง"];

/* Opening hours (Bangkok time). Overridable via env so the owner can
   change hours without touching code; the on-screen copy stays 9:00–17:00
   per the approved design unless the code is updated together. */
export const SHOP_HOURS = {
  openHour: Number(process.env.SHOP_OPEN_HOUR ?? 9),
  closeHour: Number(process.env.SHOP_CLOSE_HOUR ?? 23),
};

/* ---- Cart / order line ---- */

export type CartLine = {
  key: string;
  id: string;
  name: string;
  price: number;
  sweet: string;
  oat: boolean;
  qty: number;
  note: string;
};

export type Contact = {
  name: string;
  phone: string;
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
