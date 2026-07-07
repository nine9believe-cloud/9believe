"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BottomFixedButton, Chip, TextField, Textarea } from "@/components/ds";
import { BackBar, OrderItemRows, SectionTitle, SummaryRows, WhiteCard } from "@/components/shared";
import { NOTE_CHIPS } from "@/lib/data";
import { baht, cartTotal } from "@/lib/format";
import { useApp } from "@/components/app-context";

/* สรุปคำสั่งซื้อ — delivery form (starts empty, confirm disabled until valid),
   note chips below the extra-note textarea, order item summary */

export default function CheckoutPage() {
  const router = useRouter();
  const { ready, cart, setContact } = useApp();
  const [f, setF] = React.useState({ name: "", phone: "", house: "", chips: [] as string[], extra: "" });
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  React.useEffect(() => {
    if (ready && cart.length === 0) router.replace("/");
  }, [ready, cart.length, router]);

  const errs = {
    name: !f.name.trim(),
    phone: !/^0\d{8,9}$/.test(f.phone.replace(/[- ]/g, "")),
    house: !f.house.trim(),
  };
  const invalid = errs.name || errs.phone || errs.house;

  const set = (k: "name" | "house" | "extra") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) });
  const toggleChip = (c: string) =>
    setF({ ...f, chips: f.chips.includes(c) ? f.chips.filter((x) => x !== c) : [...f.chips, c] });

  const submit = () => {
    if (invalid) return;
    setContact(f);
    router.push("/payment");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title="สรุปคำสั่งซื้อ" onBack={() => router.push("/cart")} />
      <div style={{
        flex: 1, overflowY: "auto", padding: "4px 16px 24px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <SectionTitle>ข้อมูลจัดส่ง</SectionTitle>
        <TextField label="ชื่อผู้รับ" required value={f.name} onChange={set("name")} />
        <div onBlur={() => setPhoneTouched(true)}>
          <TextField
            label="เบอร์โทร" required type="tel" inputMode="numeric" maxLength={10}
            value={f.phone} onChange={setPhone}
            error={phoneTouched && f.phone.length > 0 && errs.phone}
            helpText={phoneTouched && f.phone.length > 0 && errs.phone ? "เบอร์โทร 9–10 หลัก ขึ้นต้นด้วย 0" : ""}
          />
        </div>
        <TextField label="บ้านเลขที่" required value={f.house} onChange={set("house")} placeholder="เช่น 54/447" />

        <Textarea
          label="หมายเหตุ (ถ้ามี)" rows={2} value={f.extra}
          onChange={set("extra")} placeholder="บอกอะไรร้านเพิ่มได้เลย"
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: -4 }}>
          {NOTE_CHIPS.map((c) => (
            <Chip key={c} selected={f.chips.includes(c)} onClick={() => toggleChip(c)}
              style={{ height: 36, borderRadius: 12 }}>{c}</Chip>
          ))}
        </div>

        <SectionTitle>รายการที่สั่ง</SectionTitle>
        <WhiteCard style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OrderItemRows items={cart} />
          <SummaryRows cart={cart} showDrinks={false} />
        </WhiteCard>
      </div>
      <BottomFixedButton
        primaryLabel={`ยืนยันและชำระเงิน · ${baht(cartTotal(cart))}`}
        primaryProps={{ disabled: invalid }}
        onPrimary={submit}
      />
    </div>
  );
}
