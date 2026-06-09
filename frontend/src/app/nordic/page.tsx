import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { nordicMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(nordicMarket);

export default function NordicHome() {
  return <SolarsApp config={nordicMarket} />;
}
