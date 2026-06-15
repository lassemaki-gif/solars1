import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { myMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(myMarket);

export default function Home() {
  return <SolarsApp config={myMarket} />;
}
