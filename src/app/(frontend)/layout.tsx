import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { defaultLocale } from "@/app/lib/localization/i18n";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vals",
  description: "Tours and celebrations in Estonia.",
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} className={nunito.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased text-stone-800">
        {children}
      </body>
    </html>
  );
}
