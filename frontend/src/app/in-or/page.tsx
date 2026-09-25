import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { inOrMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(inOrMarket);

export default function Home() {
  return <SolarsApp config={inOrMarket} />;
}
