"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BottomFixedButton } from "@/components/ds";
import { BackBar, OrderItemRows, Timeline, WhiteCard } from "@/components/shared";
import { Divider } from "@/components/ds";
import { OrderView, STEPS } from "@/lib/data";
import { baht } from "@/lib/format";
import { useApp } from "@/components/app-context";

/* ติดตามออเดอร์ — status hero + vertical timeline + order summary.
   Polls the server so the customer sees the shop's updates live. */

export default function TrackPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { orders } = useApp();
  const [order, setOrder] = React.useState<OrderView | null>(null);
  const [failed, setFailed] = React.useState(false);

  const id = params.id;
  const token = search.get("t") || orders.find((o) => o.id === id)?.token || "";

  React.useEffect(() => {
    if (!id || !token) return;
    let alive = true;
    const load = () =>
      fetch(`/api/orders/${id}?t=${token}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => { if (alive) { setOrder(d); setFailed(false); } })
        .catch(() => { if (alive && !order) setFailed(true); });
    load();
    const iv = setInterval(load, 5000);
    return () => { alive = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  if (!order) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
        <BackBar title="ออเดอร์" onBack={() => router.push("/")} />
        {failed && (
          <div style={{
            padding: 32, textAlign: "center", fontFamily: "var(--font-body)",
            color: "var(--text-tertiary)", fontSize: 14,
          }}>ไม่พบออเดอร์นี้</div>
        )}
      </div>
    );
  }

  const step = STEPS.find((s) => s.id === order.status) || STEPS[0];
  const doneAll = step.id === "done";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title={"ออเดอร์ #" + order.id} onBack={() => router.push("/")} />
      <div style={{
        flex: 1, overflowY: "auto", padding: "4px 16px 24px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* status hero */}
        <WhiteCard style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className={doneAll ? "" : "pulse"} style={{
            width: 56, height: 56, flexShrink: 0, borderRadius: "var(--radius-full)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: doneAll ? "var(--success-50)" : "var(--bg-brand-primary)",
            color: doneAll ? "var(--success-600)" : "var(--fg-brand-primary)",
          }}>
            <Icon name={step.icon} size={28} />
          </span>
          <div>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20,
              lineHeight: "28px", color: "var(--text-primary)",
            }}>{step.label}</div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: 13, lineHeight: "20px",
              color: "var(--text-tertiary)",
            }}>
              {step.msg}
              {!doneAll && <span> · คาดว่าได้รับ {order.eta}</span>}
            </div>
          </div>
        </WhiteCard>

        <WhiteCard><Timeline status={order.status} times={order.times} /></WhiteCard>

        <WhiteCard style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OrderItemRows items={order.items} />
          <Divider />
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16,
          }}>
            <span style={{ color: "var(--text-primary)" }}>รวมทั้งหมด</span>
            <span style={{ color: "var(--text-brand-secondary)" }}>{baht(order.total)}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)",
          }}>
            <Icon name="location-01" size={16} />
            <span>บ้านเลขที่ {order.contact.house} · {order.contact.name} · {order.contact.phone}</span>
          </div>
        </WhiteCard>
      </div>
      {doneAll && !order.reviewed && (
        <BottomFixedButton
          primaryLabel="ให้คะแนนรีวิวร้าน"
          onPrimary={() => router.push(`/review/${order.id}?t=${token}`)}
        />
      )}
    </div>
  );
}
