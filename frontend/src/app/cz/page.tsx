import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { czMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(czMarket);

export default function Home() {
  return <SolarsApp config={czMarket} />;
}
