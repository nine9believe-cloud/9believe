import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://9matcha.vercel.app"),
  title: "9 Matcha — สั่งเครื่องดื่ม",
  description: "สั่งมัจฉะและชานมจากร้าน ส่งถึงหน้าบ้านคุณ",
  icons: { icon: "/images/9believe-logo-mark.png" },
  openGraph: {
    title: "9 Matcha — สั่งเครื่องดื่ม",
    description: "สั่งมัจฉะและชานมจากร้าน ส่งถึงหน้าบ้านคุณ",
    images: [{ url: "/images/9believe-logo-mark.png", width: 500, height: 500, alt: "9 Matcha" }],
  },
  twitter: {
    card: "summary",
    title: "9 Matcha — สั่งเครื่องดื่ม",
    description: "สั่งมัจฉะและชานมจากร้าน ส่งถึงหน้าบ้านคุณ",
    images: ["/images/9believe-logo-mark.png"],
  },
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
