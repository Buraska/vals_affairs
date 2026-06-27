import type { Metadata } from "next";
import { Playfair_Display, Onest } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { defaultLocale } from "@/app/lib/localization/i18n";
import { SpeedInsights } from "@vercel/speed-insights/next";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Vals",
  description: "Tours and celebrations in Estonia.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} className={`${playfair.variable} ${onest.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased bg-[var(--cream)] text-[var(--dark)]">
        {children}
        <Script
          defer
          src="https://stat.thenextchance.eu/script.js"
          data-website-id="e0b618cd-0c92-4873-975c-7ca5d6da35e6"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
