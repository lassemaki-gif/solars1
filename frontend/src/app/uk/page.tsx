import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { ukMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(ukMarket);

export default function UkHome() {
  return <SolarsApp config={ukMarket} />;
}
