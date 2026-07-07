"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BackBar, EmptyState, WhiteCard } from "@/components/shared";
import { STEPS } from "@/lib/data";
import { useApp } from "@/components/app-context";

/* ออเดอร์ของฉัน — orders placed from this device (newest first);
   empty state when nothing has been ordered yet */

type Summary = { id: string; status: string };

export default function OrdersPage() {
  const router = useRouter();
  const { ready, orders } = useApp();
  const [statuses, setStatuses] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let alive = true;
    orders.forEach((o) => {
      fetch(`/api/orders/${o.id}?t=${o.token}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: Summary) => {
          if (alive) setStatuses((prev) => ({ ...prev, [o.id]: d.status }));
        })
        .catch(() => {});
    });
    return () => { alive = false; };
  }, [orders]);

  if (!ready) return <div style={{ minHeight: "100dvh" }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <BackBar title="ออเดอร์ของฉัน" onBack={() => router.push("/")} />
      {orders.length ? (
        <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => {
            const st = STEPS.find((s) => s.id === statuses[o.id]) || STEPS[0];
            return (
              <WhiteCard
                key={o.id}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                onClick={() => router.push(`/track/${o.id}?t=${o.token}`)}
              >
                <span style={{
                  width: 44, height: 44, borderRadius: "var(--radius-full)", flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "var(--bg-brand-primary)", color: "var(--fg-brand-primary)",
                }}>
                  <Icon name={st.icon} size={22} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
                    color: "var(--text-primary)",
                  }}>ออเดอร์ #{o.id}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 13,
                    color: "var(--text-brand-secondary)", fontWeight: 700,
                  }}>{st.label}</div>
                </div>
                <Icon name="arrow-right-01" size={22} style={{ color: "var(--fg-quaternary)" }} />
              </WhiteCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="menu-restaurant" title="ยังไม่มีออเดอร์"
          sub="สั่งเครื่องดื่มแก้วแรกของวันนี้กันเลย" actionLabel="สั่งเลย!"
          onAction={() => router.push("/")}
        />
      )}
    </div>
  );
}
