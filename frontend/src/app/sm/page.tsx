import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { smMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(smMarket);

export default function Home() {
  return <SolarsApp config={smMarket} />;
}
