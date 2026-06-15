import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { jpMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(jpMarket);

export default function Home() {
  return <SolarsApp config={jpMarket} />;
}
