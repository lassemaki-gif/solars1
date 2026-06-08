import { SolarsApp } from "@/components/SolarsApp";
import { itMarket } from "@/lib/market";

export default function ItHome() {
  return <SolarsApp config={itMarket} />;
}
