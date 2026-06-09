import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { isMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(isMarket);

export default function Home() {
  return <SolarsApp config={isMarket} />;
}
