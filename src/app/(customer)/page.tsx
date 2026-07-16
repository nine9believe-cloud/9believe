"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { IconButtonCircle, Logo } from "@/components/ds";
import { CartPill, ProductCard, SectionTitle } from "@/components/shared";
import { greeting } from "@/lib/format";
import { useApp } from "@/components/app-context";
import { CatChips } from "@/components/CatChips";

/* หน้าแรก — greeting, open/closed badge, category chips, menu cards */

export default function HomePage() {
  const router = useRouter();
  const { shop, menuItems, categories } = useApp();
  const [cat, setCat] = React.useState("rec");
  const [greet, setGreet] = React.useState("สวัสดี");
  React.useEffect(() => setGreet(greeting()), []);
  const closed = !shop.open;

  const sections = React.useMemo(() => {
    if (cat === "rec") {
      const s = [{ title: "แนะนำ", items: menuItems.filter((m) => m.rec) }];
      for (const c of categories) {
        const items = menuItems.filter((m) => m.cat === c.id && !m.rec);
        if (items.length) s.push({ title: c.label, items });
      }
      return s;
    }
    const label = categories.find((c) => c.id === cat)?.label ?? "";
    return [{ title: label, items: menuItems.filter((m) => m.cat === cat) }];
  }, [cat, menuItems, categories]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* header card — background spans from the very top edge (behind the
          status bar/notch) through the header content, as one container */}
      <div style={{
        background: "var(--bg-primary)", borderRadius: "0 0 28px 28px",
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 18px", boxShadow: "var(--shadow-xs)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo height={44} />
          <div style={{ display: "flex", gap: 4 }}>
            <IconButtonCircle type="ghost" size="md" aria-label="ค้นหาเมนู" onClick={() => router.push("/menu")}>
              <Icon name="search-01" size={24} />
            </IconButtonCircle>
            <IconButtonCircle type="ghost" size="md" aria-label="ออเดอร์ของฉัน" onClick={() => router.push("/orders")}>
              <Icon name="clock-01" size={24} />
            </IconButtonCircle>
          </div>
        </div>
        <div style={{
          marginTop: 10, fontFamily: "var(--font-heading)", fontWeight: 500,
          fontSize: 22, lineHeight: "30px", color: "var(--text-primary)",
        }}>
          {greet} 👋
        </div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 30,
            padding: "0 12px", borderRadius: "var(--radius-full)",
            background: closed ? "var(--error-50)" : "var(--success-50)",
            color: closed ? "var(--error-600)" : "var(--success-600)",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "currentColor" }} />
            {closed ? "ร้านปิดอยู่" : "ร้านเปิดอยู่ตอนนี้"}
          </span>
        </div>
      </div>

      <div style={{ padding: "14px 16px 140px", display: "flex", flexDirection: "column", gap: 12 }}>
        <CatChips active={cat} onChange={setCat} />
        {sections.map((s) => (
          <React.Fragment key={s.title}>
            <SectionTitle>{s.title}</SectionTitle>
            {s.items.map((m) => <ProductCard key={m.id} item={m} closed={closed} />)}
          </React.Fragment>
        ))}
      </div>

      <CartPill />
    </div>
  );
}
