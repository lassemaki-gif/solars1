import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { skMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(skMarket);

export default function Home() {
  return <SolarsApp config={skMarket} />;
}
