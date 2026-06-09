import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoLars — see the sun on your roof",
  description: "Instant solar estimates for European homes.",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`,
              }}
            />
          </>
        )}
      </head>
      <body className="grain min-h-screen">{children}</body>
    </html>
  );
}
