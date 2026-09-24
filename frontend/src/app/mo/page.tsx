import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { moMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(moMarket);

export default function Home() {
  return <SolarsApp config={moMarket} />;
}
