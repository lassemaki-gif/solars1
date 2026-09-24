import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { pkMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(pkMarket);

export default function Home() {
  return <SolarsApp config={pkMarket} />;
}
