import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { noMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(noMarket);

export default function Home() {
  return <SolarsApp config={noMarket} />;
}
