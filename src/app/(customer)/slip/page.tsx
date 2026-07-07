"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BottomFixedButton } from "@/components/ds";
import { BackBar, WhiteCard } from "@/components/shared";
import { baht, cartTotal } from "@/lib/format";
import { useApp } from "@/components/app-context";

/* แนบสลิปโอนเงิน — amount card + real slip upload (tap or drag),
   confirm creates the order on the server then goes to tracking */

export default function SlipPage() {
  const router = useRouter();
  const { ready, cart, setCart, contact, addOrderRef, showToast } = useApp();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const placedRef = React.useRef(false);
  const total = cartTotal(cart);

  React.useEffect(() => {
    if (ready && !placedRef.current && (cart.length === 0 || !contact)) router.replace("/");
  }, [ready, cart.length, contact, router]);

  React.useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | undefined | null) => {
    if (f && f.type.startsWith("image/")) setFile(f);
  };

  const confirm = async () => {
    if (!file || !contact || sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("order", JSON.stringify({ items: cart, contact }));
      fd.append("slip", file);
      const res = await fetch("/api/orders", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        showToast(d.error || "ส่งออเดอร์ไม่สำเร็จ ลองอีกครั้ง");
        setSending(false);
        return;
      }
      placedRef.current = true;
      addOrderRef({ id: d.id, token: d.token, createdAt: Date.now() });
      setCart([]);
      router.push(`/track/${d.id}?t=${d.token}`);
    } catch {
      showToast("ส่งออเดอร์ไม่สำเร็จ ลองอีกครั้ง");
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title="แนบสลิปโอนเงิน" onBack={() => router.push("/payment")} />
      <div style={{
        flex: 1, overflowY: "auto", padding: "4px 16px 24px",
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        <WhiteCard style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "18px 16px",
        }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)" }}>
            ยอดที่โอน
          </span>
          <span style={{
            fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 32,
            lineHeight: "40px", color: "var(--text-brand-secondary)",
          }}>{baht(total)}</span>
        </WhiteCard>

        <input
          ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
          style={{
            width: "100%", height: 380, borderRadius: 20, cursor: "pointer",
            background: preview ? "var(--bg-primary)" : "var(--bg-tertiary)",
            boxShadow: dragOver
              ? "inset 0 0 0 2px var(--border-brand)"
              : preview ? "var(--shadow-card)" : "inset 0 0 0 1.5px var(--border-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", transition: "box-shadow .12s ease",
          }}
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="สลิปโอนเงิน" style={{
              maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block",
            }} />
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              color: "var(--text-quaternary)", padding: 24, textAlign: "center",
            }}>
              <Icon name="image-01" size={32} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
                แตะหรือลากรูปสลิปมาวางที่นี่
              </span>
            </div>
          )}
        </div>
      </div>
      <BottomFixedButton
        primaryLabel={sending ? "กำลังส่งออเดอร์..." : file ? "ยืนยันการชำระเงิน" : "ยืนยัน"}
        primaryProps={{ disabled: !file || sending }}
        onPrimary={confirm}
      />
    </div>
  );
}
