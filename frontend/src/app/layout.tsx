import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoLars — see the sun on your roof",
  description: "Instant solar estimates for Nordic homes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
