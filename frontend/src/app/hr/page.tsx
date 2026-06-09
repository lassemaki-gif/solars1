import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { hrMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(hrMarket);

export default function Home() {
  return <SolarsApp config={hrMarket} />;
}
