import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { ptMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(ptMarket);

export default function Home() {
  return <SolarsApp config={ptMarket} />;
}
