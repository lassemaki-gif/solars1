import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { hkMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(hkMarket);

export default function Home() {
  return <SolarsApp config={hkMarket} />;
}
