"use client";

import React from "react";
import { Icon } from "./Icon";
import { BottomFixedButton, Checkbox, Textarea } from "./ds";
import { OAT_EXTRA, SWEETS } from "@/lib/data";
import { baht } from "@/lib/format";
import { useApp } from "./app-context";
import { OptionRow, ProductImage, QtyStepper } from "./shared";

/* Product detail — bottom sheet sliding up over the current screen.
   1:1 image, fixed close button, 3 sweetness pills, oat-milk checkbox. */

export function DetailSheet() {
  const { detailId, closeDetail, shop } = useApp();
  if (!detailId) return null;
  return <SheetInner key={detailId} id={detailId} onClose={closeDetail} closed={!shop.open} />;
}

function SheetInner({ id, onClose, closed }: { id: string; onClose: () => void; closed: boolean }) {
  const { addToCart, menuItems, cart, setCart } = useApp();
  const item = menuItems.find((m) => m.id === id) || menuItems[0];
  const [sweet, setSweet] = React.useState("หวานน้อย");
  const [oat, setOat] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const [note, setNote] = React.useState("");
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(timer);
  }, []);

  if (!item) return null;
  const unit = item.price + (oat ? OAT_EXTRA : 0);
  const close = () => { setShown(false); setTimeout(onClose, 280); };

  const label = (txt: string) => (
    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
      {txt}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(16,24,40,0.55)",
          opacity: shown ? 1 : 0, transition: "opacity .25s ease",
        }}
      />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, margin: "0 auto", maxWidth: 430,
        maxHeight: "94%", background: "var(--bg-primary)", borderRadius: "28px 28px 0 0",
        overflow: "hidden", display: "flex", flexDirection: "column",
        transform: shown ? "translateY(0)" : "translateY(100%)",
        transition: "transform .32s cubic-bezier(.32,.72,.33,1)",
      }}>
        {/* close — fixed over the sheet, stays put while content scrolls */}
        <button
          type="button" onClick={close} aria-label="ปิด"
          style={{
            position: "absolute", top: 16, left: 16, zIndex: 5, width: 44, height: 44,
            borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
            background: "var(--bg-primary)", color: "var(--text-primary)",
            boxShadow: "var(--shadow-sm)", display: "inline-flex", alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="cancel-01" size={20} />
        </button>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {/* 1:1 image */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <ProductImage src={item.image} w="100%" h="100%" r={0} />
          </div>

          <div style={{ padding: "20px 16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 26,
                  lineHeight: "34px", color: "var(--text-primary)",
                }}>{item.name}</span>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 22,
                  color: "var(--text-brand-secondary)",
                }}>{baht(unit)}</span>
              </div>
              <p style={{
                margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: 15,
                lineHeight: "23px", color: "var(--text-tertiary)",
              }}>{item.desc}</p>
            </div>

            {label("ระดับความหวาน")}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: -6 }}>
              {SWEETS.map((s) => {
                const sel = sweet === s;
                return (
                  <button
                    key={s} type="button" onClick={() => setSweet(s)}
                    style={{
                      height: 48, padding: "0 20px", borderRadius: "var(--radius-full)",
                      border: "none", cursor: "pointer", fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 15,
                      background: sel ? "var(--bg-primary)" : "var(--gray-light-100)",
                      boxShadow: sel ? "inset 0 0 0 1.5px var(--border-brand)" : "none",
                      color: sel ? "var(--brand-700)" : "var(--text-secondary)",
                      transition: "box-shadow .12s ease, background-color .12s ease",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {item.milk && (
              <OptionRow selected={oat} onClick={() => setOat((v) => !v)}>
                <span style={{ pointerEvents: "none", display: "inline-flex" }}>
                  <Checkbox checked={oat} onChange={() => {}} />
                </span>
                <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-primary)" }}>
                  นมโอ๊ต
                </span>
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
                  color: "var(--text-brand-secondary)",
                }}>+{baht(OAT_EXTRA)}</span>
              </OptionRow>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {label("จำนวน")}
              <QtyStepper qty={qty} onChange={setQty} min={0} />
            </div>

            <Textarea
              label="หมายเหตุถึงร้าน" rows={2} value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ถ้ามี"
            />
          </div>
        </div>
        <BottomFixedButton
          primaryLabel={
            qty === 0 ? "กลับไปหน้าหลัก" : closed ? "ร้านปิดอยู่" : `เพิ่มในออเดอร์ · ${baht(unit * qty)}`
          }
          primaryProps={{
            disabled: qty === 0 ? false : closed,
            leadingIcon: qty === 0 || closed ? null : <Icon name="plus-sign" size={22} />,
          }}
          onPrimary={() => {
            if (qty === 0) {
              setCart(cart.filter((l) => l.id !== item.id));
              close();
              return;
            }
            addToCart(item, { sweet, oat, qty, note });
            close();
          }}
        />
      </div>
    </div>
  );
}
