import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { lvMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(lvMarket);

export default function Home() {
  return <SolarsApp config={lvMarket} />;
}
