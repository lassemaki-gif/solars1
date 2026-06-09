import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { dkMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(dkMarket);

export default function Home() {
  return <SolarsApp config={dkMarket} />;
}
