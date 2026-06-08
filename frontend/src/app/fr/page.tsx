import { SolarsApp } from "@/components/SolarsApp";
import { frMarket } from "@/lib/market";

export default function FrHome() {
  return <SolarsApp config={frMarket} />;
}
