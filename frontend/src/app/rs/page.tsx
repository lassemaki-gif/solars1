import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { rsMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(rsMarket);

export default function Home() {
  return <SolarsApp config={rsMarket} />;
}
