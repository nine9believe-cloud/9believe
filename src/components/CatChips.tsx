"use client";

import { REC_FILTER } from "@/lib/data";
import { useApp } from "./app-context";

/* Category chip row (white pills, selected = warm tan) */
export function CatChips({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { categories } = useApp();
  const cats = [REC_FILTER, ...categories];
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto", padding: "2px 16px 6px",
      margin: "0 -16px", scrollbarWidth: "none",
    }}>
      {cats.map((c) => {
        const sel = c.id === active;
        return (
          <button
            key={c.id} type="button" onClick={() => onChange(c.id)}
            style={{
              flexShrink: 0, height: 44, padding: "0 20px", borderRadius: 16, border: "none",
              cursor: "pointer", background: sel ? "var(--brand-200)" : "var(--bg-primary)",
              boxShadow: sel ? "none" : "var(--shadow-xs)", fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 15, color: sel ? "var(--brand-800)" : "var(--text-secondary)",
              transition: "background-color .15s ease",
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
