import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { auMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(auMarket);

export default function Home() {
  return <SolarsApp config={auMarket} />;
}
