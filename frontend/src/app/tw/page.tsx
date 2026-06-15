import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { twMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(twMarket);

export default function Home() {
  return <SolarsApp config={twMarket} />;
}
