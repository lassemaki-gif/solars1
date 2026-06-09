import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { roMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(roMarket);

export default function Home() {
  return <SolarsApp config={roMarket} />;
}
