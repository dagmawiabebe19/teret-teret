import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { DebugPanel } from "@/components/DebugPanel";
import { InstallPromptShell } from "@/components/InstallPromptShell";
import { VercelAnalytics } from "@/components/VercelAnalytics";

export const viewport: Viewport = {
  themeColor: "#1a0533",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://teretstories.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Teret Stories — Amharic Bedtime Stories for Kids",
  description:
    "Personalized Amharic bedtime stories where your child is the hero. Free to try. Stories in Amharic, English, and Spanish. Safe for kids.",
  manifest: "/manifest.json",
  keywords: [
    "Amharic bedtime stories",
    "Ethiopian children's stories",
    "Teret",
    "ተረት",
    "diaspora kids Amharic",
  ],
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
    title: "Teret Stories — Amharic Bedtime Stories for Kids",
    description:
      "Personalized Amharic bedtime stories where your child is the hero. Free to try.",
    type: "website",
    url: APP_URL,
    siteName: "Teret Stories",
    locale: "en_US",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Teret Stories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teret Stories — Amharic Bedtime Stories",
    description: "Personalized Amharic bedtime stories where your child is the hero.",
    images: ["/icon-512.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Teret Stories",
    url: APP_URL,
    description:
      "Personalized Amharic bedtime stories for Ethiopian children and diaspora families.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
        <InstallPromptShell />
        <DebugPanel />
        <VercelAnalytics />
      </body>
    </html>
  );
}
