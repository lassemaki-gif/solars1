import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inMrMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inMrMarket);

export default function Home() {
  return <SolarsApp config={inMrMarket} />;
}
