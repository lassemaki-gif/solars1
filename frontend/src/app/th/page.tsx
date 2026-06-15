import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { thMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(thMarket);

export default function Home() {
  return <SolarsApp config={thMarket} />;
}
