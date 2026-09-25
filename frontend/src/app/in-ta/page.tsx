import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inTaMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inTaMarket);

export default function Home() {
  return <SolarsApp config={inTaMarket} />;
}
