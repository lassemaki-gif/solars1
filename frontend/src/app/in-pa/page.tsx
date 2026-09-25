import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inPaMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inPaMarket);

export default function Home() {
  return <SolarsApp config={inPaMarket} />;
}
