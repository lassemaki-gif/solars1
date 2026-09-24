import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { alMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(alMarket);

export default function Home() {
  return <SolarsApp config={alMarket} />;
}
