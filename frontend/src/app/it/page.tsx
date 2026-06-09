import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { itMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(itMarket);

export default function Home() {
  return <SolarsApp config={itMarket} />;
}
