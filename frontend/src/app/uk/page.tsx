import { SolarsApp } from "@/components/SolarsApp";
import { ukMarket } from "@/lib/market";

export default function UkHome() {
  return <SolarsApp config={ukMarket} />;
}
