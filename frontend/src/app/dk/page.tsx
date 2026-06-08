import { SolarsApp } from "@/components/SolarsApp";
import { dkMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={dkMarket} />;
}
