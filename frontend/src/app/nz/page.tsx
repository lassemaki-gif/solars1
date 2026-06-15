import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { nzMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(nzMarket);

export default function Home() {
  return <SolarsApp config={nzMarket} />;
}
