import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { idMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(idMarket);

export default function Home() {
  return <SolarsApp config={idMarket} />;
}
