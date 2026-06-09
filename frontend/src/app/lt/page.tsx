import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { ltMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(ltMarket);

export default function Home() {
  return <SolarsApp config={ltMarket} />;
}
