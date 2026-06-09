import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { gbMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(gbMarket);

export default function Home() {
  return <SolarsApp config={gbMarket} />;
}
