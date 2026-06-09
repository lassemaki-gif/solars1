import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { plMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(plMarket);

export default function Home() {
  return <SolarsApp config={plMarket} />;
}
