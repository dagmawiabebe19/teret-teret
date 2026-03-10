import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { DebugPanel } from "@/components/DebugPanel";

export const viewport: Viewport = {
  themeColor: "#2d1b69",
};

export const metadata: Metadata = {
  title: "ተረት ተረት — Teret Teret | Magical Ethiopian Bedtime Stories",
  description:
    "Magical Ethiopian bedtime stories for children. Tell personalized stories in Amharic, English, and Spanish. Child-safe, G-rated.",
  manifest: "/manifest.json",
  openGraph: {
    title: "ተረት ተረት — Teret Teret | Magical Ethiopian Bedtime Stories",
    description:
      "Magical Ethiopian bedtime stories for children. Tell personalized stories in Amharic, English, and Spanish.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
        <DebugPanel />
      </body>
    </html>
  );
}
