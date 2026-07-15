"use client";

import React from "react";
import { Icon } from "@/components/Icon";
import {
  BottomFixedButton, Button, Checkbox, Chip, Dialog, Divider,
  IconButtonCircle, TextField, Textarea, Toggle,
} from "@/components/ds";
import { CartLine, Category, MenuItem, OrderStatus, STATUS_ORDER, STEPS } from "@/lib/data";
import { AdminMenuItem } from "@/lib/menu";
import { baht, optionText, lineUnit } from "@/lib/format";

/* หน้าร้าน (เจ้าของ) — จัดการออเดอร์ ตรวจสลิป อัปเดตสถานะ เปิด/ปิดร้าน */

type AdminOrder = {
  id: string;
  createdAt: number;
  items: CartLine[];
  total: number;
  contact: { name: string; phone: string; soi: string; house: string; chips: string[]; extra: string };
  status: OrderStatus;
  times: Partial<Record<OrderStatus, string>>;
  slipUrl: string | null;
  reviewed: boolean;
};

type Review = {
  id: number;
  orderId: string;
  stars: number;
  text: string;
  photoUrl: string | null;
  createdAt: number;
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  verify: "ยืนยันการชำระ · เริ่มชง",
  brewing: "ชงเสร็จแล้ว · เตรียมจัดส่ง",
  prepare: "ออกไปส่งแล้ว",
  deliver: "จัดส่งสำเร็จ",
  done: "",
};

const STATUS_CHIP: Record<OrderStatus, "primary" | "success" | "error" | "gray"> = {
  verify: "error",
  brewing: "primary",
  prepare: "primary",
  deliver: "primary",
  done: "success",
};

export default function AdminPage() {
  const [checked, setChecked] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => { setAuthed(Boolean(d.admin)); setChecked(true); })
      .catch(() => setChecked(true));
  }, []);

  if (!checked) return <div className="app-shell" />;
  return (
    <div className="app-shell">
      {authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Login onOk={() => setAuthed(true)} />}
    </div>
  );
}

/* ---------- PIN login ---------- */

function Login({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    }).catch(() => null);
    if (res && res.ok) { onOk(); return; }
    setErr("รหัส PIN ไม่ถูกต้อง");
    setBusy(false);
  };

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16, padding: 32,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/9believe-logo-mark.png" alt="9believe" style={{ height: 72 }} />
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>
        หน้าร้าน 9believe
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)" }}>
        ใส่รหัส PIN เพื่อเข้าจัดการออเดอร์
      </div>
      <div style={{ width: "100%", maxWidth: 280 }}>
        <TextField
          label="รหัส PIN" type="password" inputMode="numeric" value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 12))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          error={Boolean(err)} helpText={err}
        />
      </div>
      <Button size="md" onClick={submit} disabled={!pin || busy}>เข้าสู่ระบบ</Button>
    </div>
  );
}

/* ---------- dashboard ---------- */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = React.useState<"orders" | "reviews" | "menu" | "categories">("orders");
  const [adminOpen, setAdminOpen] = React.useState(true);
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [menuItems, setMenuItems] = React.useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    fetch("/api/shop").then((r) => r.json()).then((d) => setAdminOpen(Boolean(d.adminOpen))).catch(() => {});
    fetch("/api/orders").then((r) => (r.ok ? r.json() : [])).then(setOrders).catch(() => {});
    fetch("/api/admin/reviews").then((r) => (r.ok ? r.json() : [])).then(setReviews).catch(() => {});
    fetch("/api/admin/menu").then((r) => (r.ok ? r.json() : [])).then(setMenuItems).catch(() => {});
    fetch("/api/admin/categories").then((r) => (r.ok ? r.json() : [])).then(setCategories).catch(() => {});
  }, []);

  React.useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [load]);

  const toggleShop = async (v: boolean) => {
    setAdminOpen(v);
    await fetch("/api/shop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ open: v }),
    }).catch(() => {});
  };

  const advance = async (o: AdminOrder) => {
    const idx = STATUS_ORDER.indexOf(o.status);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
    const status = STATUS_ORDER[idx + 1];
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (res && res.ok) load();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    onLogout();
  };

  const active = orders.filter((o) => o.status !== "done");
  const finished = orders.filter((o) => o.status === "done");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      {/* header */}
      <div style={{
        background: "var(--bg-primary)", borderRadius: "0 0 28px 28px",
        padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 18px", boxShadow: "var(--shadow-xs)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/9believe-logo-mark.png" alt="" style={{ height: 36 }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
              หน้าร้าน
            </span>
          </div>
          <button
            type="button" onClick={logout} aria-label="ออกจากระบบ"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px",
              borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
              background: "var(--bg-secondary)", color: "var(--text-tertiary)",
              fontFamily: "var(--font-body)", fontSize: 13,
            }}
          >
            <Icon name="logout-01" size={16} /> ออก
          </button>
        </div>
        <div style={{
          marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 16, background: "var(--bg-secondary)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="store-01" size={22} style={{ color: adminOpen ? "var(--success-600)" : "var(--error-600)" }} />
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
              {adminOpen ? "ร้านเปิดอยู่" : "ร้านปิดชั่วคราว"}
            </div>
          </div>
          <Toggle checked={adminOpen} onChange={toggleShop} />
        </div>
        {/* tabs */}
        <div style={{ marginTop: 14, display: "flex", gap: 8, overflowX: "auto" }}>
          {([
            ["orders", `ออเดอร์ (${active.length})`],
            ["reviews", `รีวิว (${reviews.length})`],
            ["menu", `เมนู (${menuItems.length})`],
            ["categories", `หมวดหมู่ (${categories.length})`],
          ] as const).map(([id, label]) => {
            const sel = tab === id;
            return (
              <button
                key={id} type="button" onClick={() => setTab(id)}
                style={{
                  height: 40, padding: "0 18px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: sel ? "var(--brand-200)" : "var(--bg-secondary)",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
                  color: sel ? "var(--brand-800)" : "var(--text-secondary)",
                }}
              >{label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "14px 16px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {tab === "orders" ? (
          <>
            {orders.length === 0 && (
              <div style={{
                padding: "48px 24px", textAlign: "center", fontFamily: "var(--font-body)",
                fontSize: 14, color: "var(--text-tertiary)",
              }}>ยังไม่มีออเดอร์เข้ามา</div>
            )}
            {[...active, ...finished].map((o) => (
              <OrderCard key={o.id} o={o} open={openId === o.id}
                onToggle={() => setOpenId(openId === o.id ? null : o.id)}
                onAdvance={() => advance(o)} />
            ))}
          </>
        ) : tab === "menu" ? (
          <MenuTab items={menuItems} categories={categories} onChange={load} />
        ) : tab === "categories" ? (
          <CategoryTab categories={categories} onChange={load} />
        ) : (
          <>
            {reviews.length === 0 && (
              <div style={{
                padding: "48px 24px", textAlign: "center", fontFamily: "var(--font-body)",
                fontSize: 14, color: "var(--text-tertiary)",
              }}>ยังไม่มีรีวิวจากลูกค้า</div>
            )}
            {reviews.map((r) => (
              <div key={r.id} style={{
                background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
                padding: 16, display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} style={{ color: n <= r.stars ? "var(--warning-400)" : "var(--gray-light-300)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
                        </svg>
                      </span>
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-quaternary)" }}>
                    ออเดอร์ #{r.orderId}
                  </span>
                </div>
                {r.text && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "22px", color: "var(--text-secondary)" }}>
                    {r.text}
                  </div>
                )}
                {r.photoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.photoUrl} alt="" style={{ width: "100%", borderRadius: 12, display: "block" }} />
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- order card ---------- */

function OrderCard({ o, open, onToggle, onAdvance }: {
  o: AdminOrder; open: boolean; onToggle: () => void; onAdvance: () => void;
}) {
  const step = STEPS.find((s) => s.id === o.status) || STEPS[0];
  const timeLabel = new Date(o.createdAt).toLocaleTimeString("th-TH", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
  }) + " น.";
  return (
    <div style={{
      background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
      overflow: "hidden",
    }}>
      <div onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: 12, padding: 16, cursor: "pointer",
      }}>
        <span style={{
          width: 44, height: 44, borderRadius: "var(--radius-full)", flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: o.status === "done" ? "var(--success-50)" : "var(--bg-brand-primary)",
          color: o.status === "done" ? "var(--success-600)" : "var(--fg-brand-primary)",
        }}>
          <Icon name={step.icon} size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
              #{o.id}
            </span>
            <Chip size="sm" color={STATUS_CHIP[o.status]}>{step.label}</Chip>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-quaternary)" }}>
            {timeLabel} · {o.contact.name} · {baht(o.total)}
          </div>
        </div>
        <Icon name={open ? "arrow-left-01" : "arrow-right-01"} size={20}
          style={{ color: "var(--fg-quaternary)", transform: open ? "rotate(-90deg)" : "rotate(90deg)" }} />
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Divider />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {o.items.map((l) => (
              <div key={l.key} style={{
                display: "flex", justifyContent: "space-between", gap: 12,
                fontFamily: "var(--font-body)", fontSize: 14,
              }}>
                <span style={{ color: "var(--text-primary)" }}>
                  {l.qty}× {l.name}
                  <span style={{ color: "var(--text-quaternary)", fontSize: 12 }}> · {optionText(l)}</span>
                  {l.note && <span style={{ color: "var(--text-quaternary)", fontSize: 12 }}> · “{l.note}”</span>}
                </span>
                <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>{baht(lineUnit(l) * l.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)",
          }}>
            <Icon name="location-01" size={16} style={{ marginTop: 2 }} />
            <span>
              {o.contact.soi && <>ซอย {o.contact.soi} · </>}
              บ้านเลขที่ {o.contact.house}
              {o.contact.name && <> · {o.contact.name}</>}
              {o.contact.phone && <> · {o.contact.phone}</>}
              {o.contact.chips.length > 0 && <> · {o.contact.chips.join(" · ")}</>}
              {o.contact.extra && <> · “{o.contact.extra}”</>}
            </span>
          </div>
          {o.slipUrl && (
            <div>
              <div style={{
                fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6,
              }}>สลิปโอนเงิน · ยอดที่ต้องได้รับ <b style={{ color: "var(--text-brand-secondary)" }}>{baht(o.total)}</b></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.slipUrl} alt={"สลิปออเดอร์ " + o.id} style={{
                width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 12,
                background: "var(--bg-secondary)", display: "block",
              }} />
            </div>
          )}
          {o.status !== "done" && (
            <Button size="md" fullWidth onClick={onAdvance}>{NEXT_LABEL[o.status]}</Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- menu management (master list CRUD) ---------- */

function MenuTab({ items, categories, onChange }: {
  items: AdminMenuItem[]; categories: Category[]; onChange: () => void;
}) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AdminMenuItem | null>(null);
  const [deleting, setDeleting] = React.useState<AdminMenuItem | null>(null);
  const [busy, setBusy] = React.useState(false);

  const openCreate = () => { setEditingItem(null); setFormOpen(true); };
  const openEdit = (m: AdminMenuItem) => { setEditingItem(m); setFormOpen(true); };

  const toggleActive = async (m: AdminMenuItem, active: boolean) => {
    const res = await fetch(`/api/admin/menu/${m.id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    }).catch(() => null);
    if (res && res.ok) onChange();
  };

  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    const res = await fetch(`/api/admin/menu/${deleting.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    setDeleting(null);
    if (res && res.ok) onChange();
  };

  return (
    <>
      <Button size="md" leadingIcon={<Icon name="plus-sign" size={20} />} onClick={openCreate}>
        เพิ่มเมนู
      </Button>

      {items.length === 0 && (
        <div style={{
          padding: "48px 24px", textAlign: "center", fontFamily: "var(--font-body)",
          fontSize: 14, color: "var(--text-tertiary)",
        }}>ยังไม่มีเมนู</div>
      )}

      {items.map((m) => (
        <div key={m.id} style={{
          background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
          padding: 12, display: "flex", gap: 12, alignItems: "center",
          opacity: m.active ? 1 : 0.5,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.image} alt="" style={{
            width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                {m.name}
              </span>
              {m.rec && <Chip size="sm" color="primary">แนะนำ</Chip>}
              {!m.active && <Chip size="sm" color="gray">ซ่อนอยู่</Chip>}
            </div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-quaternary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {categories.find((c) => c.id === m.cat)?.label ?? m.cat} · {baht(m.price)}{m.milk ? " · มีนมโอ๊ต" : ""}
            </div>
          </div>
          <Toggle checked={m.active} onChange={(v) => toggleActive(m, v)} />
          <IconButtonCircle type="ghost" size="sm" aria-label={"แก้ไข " + m.name} onClick={() => openEdit(m)}>
            <Icon name="edit-02" size={18} />
          </IconButtonCircle>
          <IconButtonCircle
            type="ghost" size="sm" aria-label={"ลบ " + m.name} onClick={() => setDeleting(m)}
            style={{ color: "var(--error-600)" }}
          >
            <Icon name="delete-02" size={18} />
          </IconButtonCircle>
        </div>
      ))}

      {formOpen && (
        <MenuFormSheet
          initial={editingItem}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={onChange}
        />
      )}

      {deleting && (
        <Dialog
          onClose={() => setDeleting(null)}
          title={`ลบ "${deleting.name}"?`}
          actions={
            <>
              <Button variant="outlined" fullWidth onClick={() => setDeleting(null)}>ยกเลิก</Button>
              <Button fullWidth onClick={remove} disabled={busy}>{busy ? "กำลังลบ..." : "ลบเมนู"}</Button>
            </>
          }
        >
          ลบแล้วจะไม่สามารถกู้คืนได้
        </Dialog>
      )}
    </>
  );
}

function MenuFormSheet({ initial, categories, onClose, onSaved }: {
  initial: MenuItem | null; categories: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [desc, setDesc] = React.useState(initial?.desc ?? "");
  const [price, setPrice] = React.useState(initial ? String(initial.price) : "");
  const [cat, setCat] = React.useState(initial?.cat ?? categories[0]?.id ?? "");
  const [milk, setMilk] = React.useState(initial?.milk ?? false);
  const [rec, setRec] = React.useState(initial?.rec ?? false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState(initial?.image ?? "");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (busy) return;
    const priceNum = Number(price);
    if (!name.trim() || !Number.isInteger(priceNum) || priceNum < 0 || !cat) {
      setErr("กรอกชื่อ ราคา และเลือกหมวดหมู่ให้ถูกต้อง");
      return;
    }
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("desc", desc.trim());
    fd.set("price", String(priceNum));
    fd.set("cat", cat);
    fd.set("milk", milk ? "1" : "0");
    fd.set("rec", rec ? "1" : "0");
    if (file) fd.set("image", file);
    const res = await fetch(initial ? `/api/admin/menu/${initial.id}` : "/api/admin/menu", {
      method: initial ? "PATCH" : "POST",
      body: fd,
    }).catch(() => null);
    setBusy(false);
    if (res && res.ok) { onSaved(); onClose(); return; }
    setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.55)" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, margin: "0 auto", maxWidth: 430,
        maxHeight: "92vh", background: "var(--bg-primary)", borderRadius: "28px 28px 0 0",
        overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "20px 16px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
            {initial ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
          </span>
          <IconButtonCircle type="ghost" size="sm" aria-label="ปิด" onClick={onClose}>
            <Icon name="cancel-01" size={20} />
          </IconButtonCircle>
        </div>

        <label style={{ alignSelf: "center", cursor: "pointer" }}>
          <input
            type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="" style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{
              width: 120, height: 120, borderRadius: 16, background: "var(--bg-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-quaternary)",
            }}>
              <Icon name="image-01" size={28} />
            </div>
          )}
        </label>

        <TextField label="ชื่อเมนู" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="รายละเอียด" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <TextField
          label="ราคา (บาท)" inputMode="numeric" value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
        />

        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
            หมวดหมู่
          </div>
          {categories.length === 0 ? (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>
              ยังไม่มีหมวดหมู่ — เพิ่มหมวดหมู่ก่อนในแท็บ &quot;หมวดหมู่&quot;
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((c) => {
                const sel = cat === c.id;
                return (
                  <button
                    key={c.id} type="button" onClick={() => setCat(c.id)}
                    style={{
                      height: 40, padding: "0 16px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: sel ? "var(--brand-200)" : "var(--bg-secondary)",
                      fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
                      color: sel ? "var(--brand-800)" : "var(--text-secondary)",
                    }}
                  >{c.label}</button>
                );
              })}
            </div>
          )}
        </div>

        <Checkbox checked={milk} onChange={() => setMilk((v) => !v)} label="มีตัวเลือกนมโอ๊ต" />
        <Checkbox checked={rec} onChange={() => setRec((v) => !v)} label="แสดงในเมนูแนะนำ" />

        {err && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--error-600)" }}>{err}</div>
        )}

        <Button size="md" fullWidth onClick={submit} disabled={busy}>
          {busy ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </div>
    </div>
  );
}

/* ---------- category management (CRUD) ---------- */

function CategoryTab({ categories, onChange }: { categories: Category[]; onChange: () => void }) {
  const [adding, setAdding] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editLabel, setEditLabel] = React.useState("");
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const submitAdd = async () => {
    const label = newLabel.trim();
    if (!label || busy) return;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => null);
    setBusy(false);
    if (res && res.ok) {
      setNewLabel("");
      setAdding(false);
      onChange();
    } else {
      setErr("เพิ่มหมวดหมู่ไม่สำเร็จ");
    }
  };

  const startEdit = (c: Category) => { setEditingId(c.id); setEditLabel(c.label); setErr(""); };

  const submitEdit = async () => {
    const label = editLabel.trim();
    if (!editingId || !label || busy) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/admin/categories/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => null);
    setBusy(false);
    if (res && res.ok) {
      setEditingId(null);
      onChange();
    } else {
      setErr("แก้ไขหมวดหมู่ไม่สำเร็จ");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= categories.length) return;
    const order = categories.map((c) => c.id);
    [order[idx], order[j]] = [order[j], order[idx]];
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    }).catch(() => null);
    onChange();
  };

  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/admin/categories/${deleting.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    setDeleting(null);
    if (res && res.ok) {
      onChange();
      return;
    }
    const body = await res?.json().catch(() => null);
    setErr(body?.error || "ลบหมวดหมู่ไม่สำเร็จ");
  };

  return (
    <>
      {!adding ? (
        <Button size="md" leadingIcon={<Icon name="plus-sign" size={20} />} onClick={() => setAdding(true)}>
          เพิ่มหมวดหมู่
        </Button>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="ชื่อหมวดหมู่" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); }} autoFocus
            />
          </div>
          <Button size="md" onClick={submitAdd} disabled={busy || !newLabel.trim()}>บันทึก</Button>
          <Button size="md" variant="outlined" onClick={() => { setAdding(false); setNewLabel(""); }}>ยกเลิก</Button>
        </div>
      )}

      {err && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--error-600)" }}>{err}</div>
      )}

      {categories.length === 0 && (
        <div style={{
          padding: "48px 24px", textAlign: "center", fontFamily: "var(--font-body)",
          fontSize: 14, color: "var(--text-tertiary)",
        }}>ยังไม่มีหมวดหมู่</div>
      )}

      {categories.map((c, i) => (
        <div key={c.id} style={{
          background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
          padding: 12, display: "flex", gap: 4, alignItems: "center",
        }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <IconButtonCircle
              type="ghost" size="xs" aria-label={"เลื่อน " + c.label + " ขึ้น"}
              onClick={() => move(i, -1)} disabled={i === 0}
            >
              <Icon name="arrow-right-01" size={14} style={{ transform: "rotate(-90deg)" }} />
            </IconButtonCircle>
            <IconButtonCircle
              type="ghost" size="xs" aria-label={"เลื่อน " + c.label + " ลง"}
              onClick={() => move(i, 1)} disabled={i === categories.length - 1}
            >
              <Icon name="arrow-right-01" size={14} style={{ transform: "rotate(90deg)" }} />
            </IconButtonCircle>
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: "0 4px" }}>
            {editingId === c.id ? (
              <TextField
                value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") setEditingId(null); }}
                autoFocus
              />
            ) : (
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                {c.label}
              </span>
            )}
          </div>
          {editingId === c.id ? (
            <>
              <IconButtonCircle type="ghost" size="sm" aria-label="บันทึก" onClick={submitEdit} disabled={busy}>
                <Icon name="tick-02" size={18} />
              </IconButtonCircle>
              <IconButtonCircle type="ghost" size="sm" aria-label="ยกเลิก" onClick={() => setEditingId(null)}>
                <Icon name="cancel-01" size={18} />
              </IconButtonCircle>
            </>
          ) : (
            <>
              <IconButtonCircle type="ghost" size="sm" aria-label={"แก้ไข " + c.label} onClick={() => startEdit(c)}>
                <Icon name="edit-02" size={18} />
              </IconButtonCircle>
              <IconButtonCircle
                type="ghost" size="sm" aria-label={"ลบ " + c.label} onClick={() => setDeleting(c)}
                style={{ color: "var(--error-600)" }}
              >
                <Icon name="delete-02" size={18} />
              </IconButtonCircle>
            </>
          )}
        </div>
      ))}

      {deleting && (
        <Dialog
          onClose={() => setDeleting(null)}
          title={`ลบ "${deleting.label}"?`}
          actions={
            <>
              <Button variant="outlined" fullWidth onClick={() => setDeleting(null)}>ยกเลิก</Button>
              <Button fullWidth onClick={remove} disabled={busy}>{busy ? "กำลังลบ..." : "ลบหมวดหมู่"}</Button>
            </>
          }
        >
          ลบไม่ได้ถ้ายังมีเมนูอยู่ในหมวดนี้ — ย้ายเมนูออกก่อน
        </Dialog>
      )}
    </>
  );
}
