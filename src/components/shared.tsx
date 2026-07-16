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
  src, w, h, r = 16, style = {},
}: { src: string; w: number | string; h: number | string; r?: number; style?: CSS }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={src || "/images/9believe-logo-mark.png"} alt="" style={{
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
  const { openDetail, cart } = useApp();
  const count = cart.filter((l) => l.id === item.id).reduce((s, l) => s + l.qty, 0);
  return (
    <div
      onClick={() => openDetail(item.id)}
      style={{
        display: "flex", gap: 14, alignItems: "center", padding: 12, cursor: "pointer",
        background: "var(--bg-primary)", borderRadius: 20, boxShadow: "var(--shadow-card)",
      }}
    >
      <ProductImage src={item.image} w={104} h={104} r={16} />
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
        type={count > 0 ? "outline" : "tonal"} size="sm" disabled={closed} aria-label={"เลือก " + item.name}
        onClick={(e) => { e.stopPropagation(); openDetail(item.id); }}
      >
        {count > 0 ? (
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16 }}>{count}</span>
        ) : (
          <Icon name="plus-sign" size={20} />
        )}
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
  const leading = (
    <IconButtonCircle type="ghost" size="sm" aria-label="ย้อนกลับ" onClick={onBack}>
      <Icon name="arrow-left-01" size={24} />
    </IconButtonCircle>
  );
  return (
    <>
      {/* spacer: reserves the header's exact height (varies with safe-area)
          in normal flow so content doesn't jump up under the fixed bar below */}
      <div aria-hidden style={{ visibility: "hidden", pointerEvents: "none" }}>
        <TopAppBar title={title} leading={leading} trailing={trailing || null} />
      </div>
      {/* truly fixed (not sticky) — sticky silently breaks if any ancestor
          sets a non-"visible" overflow (e.g. .app-shell's overflow-x: hidden),
          so fixed is the only guarantee the header never scrolls with content */}
      <TopAppBar
        title={title}
        leading={leading}
        trailing={trailing || null}
        style={{
          background: "var(--bg-secondary)", position: "fixed", top: 0, left: 0, right: 0,
          maxWidth: 430, margin: "0 auto", zIndex: 20,
        }}
      />
    </>
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

/* ---------- swipe to delete ---------- */

const SWIPE_DELETE_WIDTH = 88;

export function SwipeToDelete({ onDelete, radius = 20, style = {}, children }: {
  onDelete: () => void; radius?: number; style?: CSS; children: React.ReactNode;
}) {
  const [x, setX] = React.useState(0);
  const drag = React.useRef<{ startX: number; startX0: number; dragging: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startX: e.clientX, startX0: x, dragging: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const delta = e.clientX - d.startX;
    if (!d.dragging && Math.abs(delta) > 4) d.dragging = true;
    if (!d.dragging) return;
    setX(Math.min(0, Math.max(-SWIPE_DELETE_WIDTH, d.startX0 + delta)));
  };
  const endDrag = () => {
    const wasDragging = drag.current?.dragging;
    drag.current = null;
    if (wasDragging) setX((cur) => (Math.abs(cur) > SWIPE_DELETE_WIDTH / 2 ? -SWIPE_DELETE_WIDTH : 0));
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: radius, ...style }}>
      <button
        type="button" onClick={onDelete} aria-label="ลบ"
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: SWIPE_DELETE_WIDTH,
          border: "none", cursor: "pointer", background: "var(--error-600)",
          color: "var(--text-white)", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
        }}
      >
        ลบ
      </button>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => { if (x !== 0) { e.preventDefault(); e.stopPropagation(); setX(0); } }}
        style={{
          position: "relative", touchAction: "pan-y",
          transform: `translateX(${x}px)`,
          transition: drag.current?.dragging ? "none" : "transform .2s ease",
        }}
      >
        {children}
      </div>
    </div>
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
      position: "fixed", left: 0, right: 0, top: "calc(env(safe-area-inset-top, 0px) + 24px)", zIndex: 60,
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
