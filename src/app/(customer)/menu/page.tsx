"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { TextField } from "@/components/ds";
import { BackBar, CartPill, EmptyState, ProductCard } from "@/components/shared";
import { CatChips } from "@/components/CatChips";
import { useApp } from "@/components/app-context";

/* ค้นหาเมนู — search field (no label) + category chips + result list */

export default function MenuPage() {
  const router = useRouter();
  const { shop, menuItems } = useApp();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("rec");
  const closed = !shop.open;
  const items = menuItems.filter(
    (m) =>
      (cat === "rec" || m.cat === cat) &&
      (!q.trim() || (m.name + m.desc).includes(q.trim()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <BackBar title="ค้นหาเมนู" onBack={() => router.push("/")} />
      <div style={{ padding: "4px 16px 140px", display: "flex", flexDirection: "column", gap: 12 }}>
        <TextField
          label="" placeholder="ค้นหาเมนู" value={q}
          onChange={(e) => setQ(e.target.value)}
          leadingIcon={<Icon name="search-01" size={20} />}
        />
        <CatChips active={cat} onChange={setCat} />
        {items.length === 0 ? (
          <EmptyState
            icon="search-01" title="ไม่พบเมนูที่ค้นหา"
            sub="ลองคำอื่น หรือดูเมนูแนะนำของร้านดูก่อน"
            actionLabel="ดูเมนูทั้งหมด" onAction={() => { setQ(""); setCat("rec"); }}
          />
        ) : (
          items.map((m) => <ProductCard key={m.id} item={m} closed={closed} />)
        )}
      </div>
      <CartPill />
    </div>
  );
}
