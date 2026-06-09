import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { deMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(deMarket);

export default function Home() {
  return <SolarsApp config={deMarket} />;
}
