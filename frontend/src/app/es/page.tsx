import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { esMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(esMarket);

export default function EsHome() {
  return <SolarsApp config={esMarket} />;
}
