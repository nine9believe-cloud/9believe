"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BottomFixedButton } from "@/components/ds";
import { BackBar, WhiteCard } from "@/components/shared";
import { baht, cartTotal } from "@/lib/format";
import { useApp } from "@/components/app-context";

/* ชำระเงิน — PromptPay QR + 5-minute countdown (brand-colored),
   download QR (with icon), attach slip (with icon) */

const PAY_WINDOW = 5 * 60 * 1000;

export default function PaymentPage() {
  const router = useRouter();
  const { ready, cart } = useApp();
  const deadlineRef = React.useRef(Date.now() + PAY_WINDOW);
  const [msLeft, setMsLeft] = React.useState(PAY_WINDOW);
  const total = cartTotal(cart);
  const expired = msLeft <= 0;

  React.useEffect(() => {
    if (ready && cart.length === 0) router.replace("/");
  }, [ready, cart.length, router]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setMsLeft(Math.max(0, deadlineRef.current - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = Math.floor(msLeft / 60000);
  const ss = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");

  const renewQr = () => { deadlineRef.current = Date.now() + PAY_WINDOW; setMsLeft(PAY_WINDOW); };
  const downloadQr = () => {
    const a = document.createElement("a");
    a.href = "/images/payment-qr.jpg";
    a.download = "9believe-promptpay-qr.jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title="ชำระเงิน" onBack={() => router.push("/checkout")} />
      <div style={{
        flex: 1, overflowY: "auto", padding: "4px 16px 24px",
        display: "flex", flexDirection: "column", gap: 14, alignItems: "center",
      }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)" }}>
          ยอดที่ต้องชำระ
        </div>
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 40,
          lineHeight: "48px", color: "var(--text-primary)", marginTop: -10,
        }}>{baht(total)}</div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, height: 34,
          padding: "0 14px", borderRadius: "var(--radius-full)",
          background: expired ? "var(--error-50)" : "var(--brand-50)",
          color: expired ? "var(--error-600)" : "var(--brand-700)",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
        }}>
          <Icon name="clock-01" size={16} />
          {expired ? "QR หมดอายุแล้ว กดขอ QR ใหม่ได้เลย" : `กรุณาชำระภายใน ${mm}:${ss} นาที`}
        </div>
        <WhiteCard style={{
          padding: 12, width: "100%", maxWidth: 300,
          opacity: expired ? 0.35 : 1, transition: "opacity .2s ease",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/payment-qr.jpg" alt="Thai QR PromptPay ของร้าน 9believe"
            style={{ width: "100%", display: "block", borderRadius: 12 }}
          />
        </WhiteCard>
        <div style={{
          width: "100%", padding: "12px 16px", boxSizing: "border-box",
          borderRadius: 16, background: "var(--bg-secondary)", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center",
          fontFamily: "var(--font-body)", fontSize: 13, lineHeight: "20px",
          color: "var(--text-tertiary)",
        }}>
          <span>สแกนจ่ายได้ทุกแอปธนาคาร เมื่อระบบยืนยันการชำระแล้วร้านจะเริ่มเตรียมออเดอร์ให้คุณทันที</span>
        </div>
      </div>
      <BottomFixedButton
        primaryLabel={expired ? "ขอ QR ใหม่" : "แนบสลิปโอนเงิน"}
        primaryProps={{
          leadingIcon: expired ? null : <Icon name="attachment-01" size={22} />,
          style: { flex: "1 1 auto", minWidth: 0, padding: "0 16px" },
        }}
        onPrimary={expired ? renewQr : () => router.push("/slip")}
        secondaryLabel="ดาวน์โหลด QR"
        secondaryProps={{
          leadingIcon: <Icon name="download-01" size={22} />,
          style: { flex: "0 0 auto", width: "auto", padding: "0 16px" },
        }}
        onSecondary={downloadQr}
      />
    </div>
  );
}
