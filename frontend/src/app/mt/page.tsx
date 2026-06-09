import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { mtMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(mtMarket);

export default function Home() {
  return <SolarsApp config={mtMarket} />;
}
