import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoLars — see the sun on your roof",
  description: "Instant solar estimates for Nordic homes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2322898189280889"
          crossOrigin="anonymous"
        />
      </head>
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
