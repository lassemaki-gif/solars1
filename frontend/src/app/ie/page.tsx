import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { ieMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(ieMarket);

export default function Home() {
  return <SolarsApp config={ieMarket} />;
}
