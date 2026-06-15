import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { brMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(brMarket);

export default function Home() {
  return <SolarsApp config={brMarket} />;
}
