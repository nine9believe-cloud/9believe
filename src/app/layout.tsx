import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "9believe — สั่งเครื่องดื่ม",
  description: "สั่งมัจฉะและชานมจากร้าน 9believe ส่งถึงหน้าบ้าน",
  icons: { icon: "/images/9believe-logo-mark.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
