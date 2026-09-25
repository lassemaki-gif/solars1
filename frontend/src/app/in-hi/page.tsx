import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inHiMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inHiMarket);

export default function Home() {
  return <SolarsApp config={inHiMarket} />;
}
