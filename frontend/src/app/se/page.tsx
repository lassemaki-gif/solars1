import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { seMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(seMarket);

export default function Home() {
  return <SolarsApp config={seMarket} />;
}
