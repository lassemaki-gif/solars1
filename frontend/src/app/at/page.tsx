import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { atMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(atMarket);

export default function Home() {
  return <SolarsApp config={atMarket} />;
}
