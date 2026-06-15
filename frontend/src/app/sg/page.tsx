import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { sgMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(sgMarket);

export default function Home() {
  return <SolarsApp config={sgMarket} />;
}
