import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { eeMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(eeMarket);

export default function Home() {
  return <SolarsApp config={eeMarket} />;
}
