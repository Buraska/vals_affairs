import type { Metadata } from "next";
import { getServerSideURL } from "@/utilities/getURL";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { SITE_DESCRIPTION, SITE_NAME } from "@/utilities/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  // The brand title template and per-locale defaults live in [locale]/layout.tsx,
  // sourced from the `web-info` global. These are ultimate fallbacks only.
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
  },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: "summary_large_image",
  },
};

// The `<html>`/`<body>` tags are rendered in `[locale]/layout.tsx` so the
// document language can vary per locale. This group root is a passthrough.
export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
