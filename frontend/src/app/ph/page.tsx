import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { phMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(phMarket);

export default function Home() {
  return <SolarsApp config={phMarket} />;
}
