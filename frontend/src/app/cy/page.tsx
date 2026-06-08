import { SolarsApp } from "@/components/SolarsApp";
import { cyMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={cyMarket} />;
}
