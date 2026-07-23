import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineIndicator } from "@/shared/components/offline-indicator";
import { PWAInstaller } from "@/shared/components/pwa-installer";

export const metadata: Metadata = {
  title: "Attachment - AI Roleplay Companion",
  description: "AI 長期角色陪伴 PWA 應用程式",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Attachment",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <OfflineIndicator />
        <main className="min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl bg-slate-900 border-x border-slate-800">
          {children}
        </main>
        <PWAInstaller />
      </body>
    </html>
  );
}
