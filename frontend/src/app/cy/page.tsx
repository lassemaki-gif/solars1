import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { cyMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(cyMarket);

export default function Home() {
  return <SolarsApp config={cyMarket} />;
}
