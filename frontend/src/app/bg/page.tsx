import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { bgMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(bgMarket);

export default function Home() {
  return <SolarsApp config={bgMarket} />;
}
