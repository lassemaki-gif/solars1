import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { usMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(usMarket);

export default function Home() {
  return <SolarsApp config={usMarket} />;
}
