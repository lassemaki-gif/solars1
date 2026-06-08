import { SolarsApp } from "@/components/SolarsApp";
import { nordicMarket } from "@/lib/market";

export default function NordicHome() {
  return <SolarsApp config={nordicMarket} />;
}
