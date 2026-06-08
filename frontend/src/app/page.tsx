import { SolarsApp } from "@/components/SolarsApp";
import { nordicMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={nordicMarket} />;
}
