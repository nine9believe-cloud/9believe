"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BottomFixedButton } from "@/components/ds";
import { BackBar, EmptyState, ProductImage, QtyStepper, SummaryRows, SwipeToDelete, WhiteCard } from "@/components/shared";
import { baht, cartTotal, lineUnit, optionText } from "@/lib/format";
import { useApp } from "@/components/app-context";

/* ตะกร้า — line items (swipe left to reveal delete), qty stepper, summary */

export default function CartPage() {
  const router = useRouter();
  const { ready, cart, setCart } = useApp();
  const back = () => router.push("/");
  const empty = cart.length === 0;

  const setQty = (key: string, qty: number) =>
    setCart(cart.map((l) => (l.key === key ? { ...l, qty } : l)));
  const remove = (key: string) => setCart(cart.filter((l) => l.key !== key));

  if (!ready) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title="ตะกร้า" onBack={back} />
      {empty ? (
        <EmptyState
          icon="shopping-basket-01" title="ตะกร้ายังว่างอยู่"
          sub="ไปเลือกเครื่องดื่มแก้วโปรดกันเลย" actionLabel="เลือกเมนู" onAction={back}
        />
      ) : (
        <>
          <div style={{
            flex: 1, overflowY: "auto", padding: "4px 16px 24px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {cart.map((l) => (
              <SwipeToDelete key={l.key} onDelete={() => remove(l.key)}>
                <WhiteCard style={{ display: "flex", gap: 12, alignItems: "center", padding: 12 }}>
                  <ProductImage src={l.image} w={64} h={64} r={12} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 16,
                      color: "var(--text-primary)",
                    }}>{l.name}</div>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: 12, lineHeight: "18px",
                      color: "var(--text-tertiary)",
                    }}>{optionText(l)}</div>
                    {l.note && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-quaternary)" }}>
                        “{l.note}”
                      </div>
                    )}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8,
                    }}>
                      <span style={{
                        fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 16,
                        color: "var(--text-brand-secondary)",
                      }}>{baht(lineUnit(l) * l.qty)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <QtyStepper qty={l.qty} onChange={(q) => setQty(l.key, q)} />
                      </div>
                    </div>
                  </div>
                </WhiteCard>
              </SwipeToDelete>
            ))}
            <WhiteCard><SummaryRows cart={cart} /></WhiteCard>
          </div>
          <BottomFixedButton
            primaryLabel={`สรุปคำสั่งซื้อ · ${baht(cartTotal(cart))}`}
            onPrimary={() => router.push("/checkout")}
          />
        </>
      )}
    </div>
  );
}
