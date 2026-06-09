import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { nlMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(nlMarket);

export default function Home() {
  return <SolarsApp config={nlMarket} />;
}
