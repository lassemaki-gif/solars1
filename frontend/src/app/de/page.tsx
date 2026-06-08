import { SolarsApp } from "@/components/SolarsApp";
import { deMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={deMarket} />;
}
