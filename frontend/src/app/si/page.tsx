import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { siMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(siMarket);

export default function Home() {
  return <SolarsApp config={siMarket} />;
}
