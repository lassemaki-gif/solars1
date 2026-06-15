import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { clMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(clMarket);

export default function Home() {
  return <SolarsApp config={clMarket} />;
}
