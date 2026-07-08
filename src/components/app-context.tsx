"use client";

import React from "react";
import { CartLine, Contact, MenuItem } from "@/lib/data";

/* App-wide client state: cart + contact persist in localStorage
   (same behaviour as the prototype), order refs keep the access
   token for each order placed from this device. */

export type OrderRef = { id: string; token: string; createdAt: number };

export type ShopInfo = { open: boolean; adminOpen: boolean };

const LS = {
  get<T>(k: string, fb: T): T {
    try {
      const v = localStorage.getItem("9b_" + k);
      return v ? (JSON.parse(v) as T) : fb;
    } catch {
      return fb;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem("9b_" + k, JSON.stringify(v));
    } catch {}
  },
};

type AppState = {
  ready: boolean;
  cart: CartLine[];
  setCart: (c: CartLine[]) => void;
  addToCart: (item: MenuItem, opt: { sweet: string; oat: boolean; qty: number; note: string }) => void;
  contact: Contact | null;
  setContact: (c: Contact) => void;
  orders: OrderRef[];
  addOrderRef: (r: OrderRef) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  detailId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  shop: ShopInfo;
  menuItems: MenuItem[];
};

const Ctx = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [cart, setCartRaw] = React.useState<CartLine[]>([]);
  const [contact, setContactRaw] = React.useState<Contact | null>(null);
  const [orders, setOrders] = React.useState<OrderRef[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [shop, setShop] = React.useState<ShopInfo>({ open: true, adminOpen: true });
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);

  React.useEffect(() => {
    setCartRaw(LS.get("cart", []));
    setContactRaw(LS.get<Contact | null>("contact", null));
    setOrders(LS.get("orders", []));
    setReady(true);
  }, []);

  React.useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/shop")
        .then((r) => r.json())
        .then((d) => { if (alive) setShop(d); })
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => { if (alive) setMenuItems(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const setCart = (c: CartLine[]) => { setCartRaw(c); LS.set("cart", c); };
  const setContact = (c: Contact) => { setContactRaw(c); LS.set("contact", c); };
  const addOrderRef = (r: OrderRef) => {
    setOrders((prev) => {
      const next = [r, ...prev];
      LS.set("orders", next);
      return next;
    });
  };

  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const addToCart: AppState["addToCart"] = (item, opt) => {
    const key = [item.id, opt.sweet, opt.oat ? 1 : 0, opt.note || ""].join("|");
    const found = cart.find((l) => l.key === key);
    const next = found
      ? cart.map((l) => (l.key === key ? { ...l, qty: l.qty + opt.qty } : l))
      : [...cart, { key, id: item.id, name: item.name, price: item.price, image: item.image, ...opt }];
    setCart(next);
    showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
  };

  return (
    <Ctx.Provider
      value={{
        ready, cart, setCart, addToCart, contact, setContact, orders, addOrderRef,
        toast, showToast, detailId, openDetail: setDetailId, closeDetail: () => setDetailId(null), shop,
        menuItems,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
