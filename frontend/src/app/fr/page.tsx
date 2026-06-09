import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { frMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(frMarket);

export default function FrHome() {
  return <SolarsApp config={frMarket} />;
}
