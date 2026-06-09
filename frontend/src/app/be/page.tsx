import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { beMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(beMarket);

export default function Home() {
  return <SolarsApp config={beMarket} />;
}
