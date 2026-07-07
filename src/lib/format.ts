import { CartLine, OAT_EXTRA, SHOP_HOURS } from "./data";

export const baht = (n: number) => "฿" + n.toLocaleString("th-TH");

export const lineUnit = (l: CartLine) => l.price + (l.oat ? OAT_EXTRA : 0);
export const cartTotal = (cart: CartLine[]) => cart.reduce((s, l) => s + lineUnit(l) * l.qty, 0);
export const cartCount = (cart: CartLine[]) => cart.reduce((s, l) => s + l.qty, 0);

export const optionText = (l: CartLine) => {
  const parts = [l.sweet];
  if (l.oat) parts.push("นมโอ๊ต");
  return parts.join(" · ");
};

const BKK = "Asia/Bangkok";

export const timeStr = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: BKK }) + " น.";

export const bangkokHour = (d = new Date()) =>
  Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: BKK }).format(d));

export const withinShopHours = (d = new Date()) => {
  const h = bangkokHour(d);
  return h >= SHOP_HOURS.openHour && h < SHOP_HOURS.closeHour;
};

export const greeting = () => {
  const h = bangkokHour();
  if (h < 11) return "สวัสดีตอนเช้า";
  if (h < 16) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
};
