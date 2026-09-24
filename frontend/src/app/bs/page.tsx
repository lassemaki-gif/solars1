import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { bsMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(bsMarket);

export default function Home() {
  return <SolarsApp config={bsMarket} />;
}
