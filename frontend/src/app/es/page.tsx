import { SolarsApp } from "@/components/SolarsApp";
import { esMarket } from "@/lib/market";

export default function EsHome() {
  return <SolarsApp config={esMarket} />;
}
