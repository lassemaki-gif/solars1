import { SolarsApp } from "@/components/SolarsApp";
import { dachMarket } from "@/lib/market";

export default function DachHome() {
  return <SolarsApp config={dachMarket} />;
}
