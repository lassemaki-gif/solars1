import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inMarket);

export default function Home() {
  return <SolarsApp config={inMarket} />;
}
