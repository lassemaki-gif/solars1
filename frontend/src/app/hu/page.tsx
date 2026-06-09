import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { huMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(huMarket);

export default function Home() {
  return <SolarsApp config={huMarket} />;
}
