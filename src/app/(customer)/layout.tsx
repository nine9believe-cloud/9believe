"use client";

import { AppProvider } from "@/components/app-context";
import { DetailSheet } from "@/components/DetailSheet";
import { Toast } from "@/components/shared";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="app-shell">{children}</div>
      <DetailSheet />
      <Toast />
    </AppProvider>
  );
}
