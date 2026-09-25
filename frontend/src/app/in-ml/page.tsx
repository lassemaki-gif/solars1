import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inMlMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inMlMarket);

export default function Home() {
  return <SolarsApp config={inMlMarket} />;
}
