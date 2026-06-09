import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { chMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(chMarket);

export default function Home() {
  return <SolarsApp config={chMarket} />;
}
