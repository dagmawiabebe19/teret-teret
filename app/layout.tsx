import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { DebugPanel } from "@/components/DebugPanel";
import { InstallPromptShell } from "@/components/InstallPromptShell";

export const viewport: Viewport = {
  themeColor: "#1a0533",
};

export const metadata: Metadata = {
  title: "ተረት ተረት — Teret Teret | Magical Ethiopian Bedtime Stories",
  description:
    "Magical Ethiopian bedtime stories for children. Tell personalized stories in Amharic, English, and Spanish. Child-safe, G-rated.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Teret",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
        <InstallPromptShell />
        <DebugPanel />
      </body>
    </html>
  );
}
