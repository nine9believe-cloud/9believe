"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { BottomFixedButton, Button, Dialog, Textarea } from "@/components/ds";
import { BackBar } from "@/components/shared";
import { useApp } from "@/components/app-context";

/* รีวิวร้าน — stars + text + optional photo, saved to the shop */

const LABELS = ["", "ต้องปรับปรุง", "พอใช้", "ดี", "ดีมาก", "สุดยอดเลย!"];

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { orders, showToast } = useApp();
  const [stars, setStars] = React.useState(0);
  const [text, setText] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const id = params.id;
  const token = search.get("t") || orders.find((o) => o.id === id)?.token || "";

  React.useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const submit = async () => {
    if (sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("stars", String(stars));
      fd.append("text", text);
      if (photo) fd.append("photo", photo);
      const res = await fetch(`/api/orders/${id}/review?t=${token}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      showToast("ขอบคุณสำหรับรีวิว 💛");
      router.push("/");
    } catch {
      showToast("ส่งรีวิวไม่สำเร็จ ลองอีกครั้ง");
      setSending(false);
      setDone(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: "100dvh" }}>
      <BackBar title="รีวิวร้าน" onBack={() => router.push(`/track/${id}?t=${token}`)} />
      <div style={{
        flex: 1, overflowY: "auto", padding: "4px 16px 24px",
        display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
      }}>
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22,
          lineHeight: "30px", color: "var(--text-primary)", textAlign: "center", marginTop: 8,
        }}>
          เครื่องดื่มวันนี้เป็นยังไงบ้าง
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n} type="button" onClick={() => setStars(n)} aria-label={n + " ดาว"}
              style={{
                width: 52, height: 52, border: "none", background: "transparent",
                cursor: "pointer", color: n <= stars ? "var(--warning-400)" : "var(--gray-light-300)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
        <div style={{
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, height: 20,
          color: "var(--text-brand-secondary)",
        }}>{LABELS[stars]}</div>
        <Textarea
          label="เครื่องดื่มเป็นอย่างไรบ้าง เล่าให้ฟังหน่อย" rows={3} value={text}
          onChange={(e) => setText(e.target.value)} placeholder="เขียนรีวิว..."
        />
        <div style={{ width: "100%" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 6,
          }}>แนบรูปภาพ (ไม่บังคับ)</div>
          <input
            ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              width: "100%", height: 140, borderRadius: 16, cursor: "pointer",
              background: preview ? "var(--bg-primary)" : "var(--bg-tertiary)",
              boxShadow: preview ? "var(--shadow-card)" : "inset 0 0 0 1.5px var(--border-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}
          >
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={preview} alt="รูปรีวิว" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
            ) : (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                color: "var(--text-quaternary)",
              }}>
                <Icon name="image-01" size={26} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13 }}>วางรูปเครื่องดื่มของคุณ</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomFixedButton
        primaryLabel="ส่งรีวิว"
        primaryProps={{ disabled: stars === 0 || sending }}
        onPrimary={() => setDone(true)}
      />
      {done && (
        <Dialog
          title="ขอบคุณสำหรับรีวิว"
          onClose={submit}
          icon={<Icon name="favourite" size={44} />}
          actions={<Button fullWidth onClick={submit} disabled={sending}>กลับหน้าแรก</Button>}
        >
          ทุกความเห็นช่วยให้ร้านเล็กๆ ของเราชงแก้วต่อไปได้ดีขึ้น แล้วพบกันใหม่
        </Dialog>
      )}
    </div>
  );
}
