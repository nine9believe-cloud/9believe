"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { Button, IconButtonCircle, TopAppBar, Divider } from "./ds";
import { CartLine, MenuItem, OrderStatus, STEPS } from "@/lib/data";
import { baht, cartCount, cartTotal, lineUnit, optionText } from "@/lib/format";
import { useApp } from "./app-context";

type CSS = React.CSSProperties;

/* ---------- product image ---------- */

export function ProductImage({
  id, w, h, r = 16, style = {},
}: { id: string; w: number | string; h: number | string; r?: number; style?: CSS }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={`/images/menu/${id}.webp`} alt="" style={{
    width: w, height: h, borderRadius: r, objectFit: "cover", flexShrink: 0, display: "block", ...style,
  }} />;
}

/* ---------- section title ---------- */

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: "8px 0 0", fontFamily: "var(--font-heading)", fontWeight: 500,
      fontSize: 22, lineHeight: "30px", color: "var(--text-primary)",
    }}>{children}</h2>
  );
}

/* ---------- product card ---------- */

export function ProductCard({ item, closed }: { item: MenuItem; closed: boolean }) {
  const { openDetail } = useApp();
  return (
    <div
      onClick={() => openDetail(item.id)}
      style={{
        display: "flex", gap: 14, alignItems: "center", padding: 12, cursor: "pointer",
        background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
      }}
    >
      <ProductImage id={item.id} w={104} h={104} r={16} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 18,
          lineHeight: "26px", color: "var(--text-primary)",
        }}>{item.name}</div>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: 13, lineHeight: "19px",
          color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{item.desc}</div>
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 20,
          lineHeight: "28px", color: "var(--text-brand-secondary)", marginTop: 2,
        }}>{baht(item.price)}</div>
      </div>
      <IconButtonCircle
        type="tonal" size="sm" disabled={closed} aria-label={"เลือก " + item.name}
        onClick={(e) => { e.stopPropagation(); openDetail(item.id); }}
      >
        <Icon name="plus-sign" size={20} />
      </IconButtonCircle>
    </div>
  );
}

/* ---------- qty stepper ---------- */

export function QtyStepper({ qty, onChange, min = 1 }: { qty: number; onChange: (q: number) => void; min?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <IconButtonCircle type="outline" size="xs" disabled={qty <= min} aria-label="ลดจำนวน"
        onClick={() => onChange(qty - 1)}>
        <Icon name="minus-sign" size={16} />
      </IconButtonCircle>
      <span style={{
        fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
        minWidth: 20, textAlign: "center", color: "var(--text-primary)",
      }}>{qty}</span>
      <IconButtonCircle type="outline" size="xs" aria-label="เพิ่มจำนวน" onClick={() => onChange(qty + 1)}>
        <Icon name="plus-sign" size={16} />
      </IconButtonCircle>
    </div>
  );
}

/* ---------- floating cart pill ---------- */

export function CartPill() {
  const { cart } = useApp();
  const router = useRouter();
  if (!cart.length) return null;
  const go = () => router.push("/cart");
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, pointerEvents: "none" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 16px 28px", pointerEvents: "auto" }}>
        <div
          onClick={go}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 10px 16px",
            background: "var(--bg-primary)", borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-dropdown)", cursor: "pointer",
          }}
        >
          <span style={{
            width: 40, height: 40, borderRadius: "var(--radius-full)", flexShrink: 0,
            background: "var(--bg-brand-primary)", display: "inline-flex", alignItems: "center",
            justifyContent: "center", color: "var(--fg-brand-primary)",
          }}>
            <Icon name="shopping-basket-01" size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 20,
              lineHeight: "26px", color: "var(--text-primary)",
            }}>{baht(cartTotal(cart))}</div>
          </div>
          <Button size="md" onClick={(e) => { e.stopPropagation(); go(); }}
            trailingIcon={
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: "var(--radius-full)",
                background: "var(--bg-primary)", color: "var(--brand-700)",
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14,
              }}>{cartCount(cart)}</span>
            }>ตะกร้า</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- empty / error / skeleton states ---------- */

export function EmptyState({
  icon, title, sub, actionLabel, onAction,
}: { icon: string; title: string; sub?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      padding: "56px 32px", textAlign: "center",
    }}>
      <span style={{
        width: 72, height: 72, borderRadius: "var(--radius-full)",
        background: "var(--bg-brand-primary)", display: "inline-flex", alignItems: "center",
        justifyContent: "center", color: "var(--fg-brand-primary)", marginBottom: 8,
      }}>
        <Icon name={icon} size={32} />
      </span>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "22px", color: "var(--text-tertiary)" }}>
          {sub}
        </div>
      )}
      {actionLabel && <Button size="md" style={{ marginTop: 12 }} onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

export function Skeleton({ w = "100%", h = 16, r = 8, style = {} }: { w?: number | string; h?: number; r?: number; style?: CSS }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function ListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[72, 64, 64, 64].map((w, i) => <Skeleton key={i} w={w} h={40} r={16} />)}
      </div>
      <Skeleton w={120} h={26} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: 12, background: "var(--bg-primary)", borderRadius: 20 }}>
          <Skeleton w={104} h={104} r={16} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
            <Skeleton w="60%" h={18} /><Skeleton w="90%" h={12} /><Skeleton w={56} h={20} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- back bar ---------- */

export function BackBar({ title, onBack, trailing }: { title: string; onBack: () => void; trailing?: React.ReactNode }) {
  return (
    <TopAppBar
      title={title}
      style={{ background: "transparent", flexShrink: 0 }}
      leading={
        <IconButtonCircle type="ghost" size="sm" aria-label="ย้อนกลับ" onClick={onBack}>
          <Icon name="arrow-left-01" size={24} />
        </IconButtonCircle>
      }
      trailing={trailing || null}
    />
  );
}

/* ---------- option row (detail sheet) ---------- */

export function OptionRow({ children, onClick, selected }: { children: React.ReactNode; onClick?: () => void; selected?: boolean }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16,
      cursor: "pointer", background: "var(--bg-primary)",
      boxShadow: `inset 0 0 0 ${selected ? 2 : 1}px ${selected ? "var(--border-brand)" : "var(--border-secondary)"}`,
      transition: "box-shadow .12s ease",
    }}>{children}</div>
  );
}

/* ---------- white card ---------- */

export function WhiteCard({ children, style = {}, ...rest }: { children: React.ReactNode; style?: CSS } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{
      background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)", padding: 16, ...style,
    }} {...rest}>{children}</div>
  );
}

/* ---------- order summary rows ---------- */

export function SummaryRows({ cart, showDrinks = true }: { cart: CartLine[]; showDrinks?: boolean }) {
  const total = cartTotal(cart);
  const row = (l: string, r: string, strong?: boolean) => (
    <div style={{
      display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)",
      fontSize: strong ? 17 : 14, fontWeight: strong ? 700 : 400,
      color: strong ? "var(--text-primary)" : "var(--text-tertiary)",
    }}>
      <span style={{ fontFamily: strong ? "var(--font-heading)" : "var(--font-body)" }}>{l}</span>
      <span style={{
        fontFamily: strong ? "var(--font-heading)" : "var(--font-body)",
        color: strong ? "var(--text-brand-secondary)" : undefined,
      }}>{r}</span>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {showDrinks && row("ค่าเครื่องดื่ม (" + cartCount(cart) + " แก้ว)", baht(total))}
      <Divider />
      {row("รวมทั้งหมด", baht(total), true)}
    </div>
  );
}

/* ---------- order items block (checkout/track) ---------- */

export function OrderItemRows({ items }: { items: CartLine[] }) {
  return (
    <>
      {items.map((l) => (
        <div key={l.key} style={{
          display: "flex", justifyContent: "space-between", gap: 12,
          fontFamily: "var(--font-body)", fontSize: 14,
        }}>
          <span style={{ color: "var(--text-primary)" }}>
            {l.qty}× {l.name}
            <span style={{ color: "var(--text-quaternary)", fontSize: 12 }}> · {optionText(l)}</span>
          </span>
          <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>{baht(lineUnit(l) * l.qty)}</span>
        </div>
      ))}
    </>
  );
}

/* ---------- vertical status timeline ---------- */

export function Timeline({ status, times }: { status: OrderStatus; times: Partial<Record<OrderStatus, string>> }) {
  const idx = STEPS.findIndex((s) => s.id === status);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {STEPS.map((s, i) => {
        const done = i < idx, active = i === idx, last = i === STEPS.length - 1;
        const fg = done ? "var(--text-white)" : active ? "var(--fg-brand-primary)" : "var(--fg-quaternary)";
        const bg = done ? "var(--bg-brand-solid)" : active ? "var(--bg-brand-primary)" : "var(--bg-secondary)";
        return (
          <div key={s.id} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{
                width: 40, height: 40, borderRadius: "var(--radius-full)", flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: bg, color: fg,
                boxShadow: active ? "inset 0 0 0 2px var(--border-brand)" : "none",
              }}>
                {done ? <Icon name="tick-02" size={20} /> : <Icon name={s.icon} size={20} />}
              </span>
              {!last && (
                <span style={{
                  width: 2, flex: 1, minHeight: 20, margin: "4px 0",
                  background: done ? "var(--bg-brand-solid)" : "var(--border-secondary)",
                }} />
              )}
            </div>
            <div style={{ paddingBottom: last ? 0 : 18, paddingTop: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: active ? 800 : 700, fontSize: 16,
                  color: active ? "var(--text-brand-secondary)" : done ? "var(--text-primary)" : "var(--text-quaternary)",
                }}>{s.label}</span>
                {times[s.id] && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-quaternary)" }}>
                    {times[s.id]}
                  </span>
                )}
              </div>
              {active && (
                <div style={{
                  fontFamily: "var(--font-body)", fontSize: 13, lineHeight: "20px",
                  color: "var(--text-tertiary)", marginTop: 2,
                }}>{s.msg}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- toast ---------- */

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, top: 24, zIndex: 60,
      display: "flex", justifyContent: "center", pointerEvents: "none",
    }}>
      <div style={{
        padding: "10px 18px", borderRadius: "var(--radius-full)",
        background: "rgba(16,24,40,0.88)", color: "#fff", fontFamily: "var(--font-body)",
        fontWeight: 700, fontSize: 13, boxShadow: "var(--shadow-dropdown)",
      }}>{toast}</div>
    </div>
  );
}
