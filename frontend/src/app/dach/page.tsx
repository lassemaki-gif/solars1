import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { dachMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(dachMarket);

export default function DachHome() {
  return <SolarsApp config={dachMarket} />;
}
