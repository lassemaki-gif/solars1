import { SolarsApp } from "@/components/SolarsApp";
import { atMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={atMarket} />;
}
