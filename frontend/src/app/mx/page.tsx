import type { Metadata } from "next";
import { SolarsApp } from "@/components/SolarsApp";
import { mxMarket } from "@/lib/market";
import { marketMetadata } from "@/lib/seo";

export const metadata: Metadata = marketMetadata(mxMarket);

export default function Home() {
  return <SolarsApp config={mxMarket} />;
}
