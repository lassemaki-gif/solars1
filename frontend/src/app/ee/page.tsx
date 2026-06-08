import { SolarsApp } from "@/components/SolarsApp";
import { eeMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={eeMarket} />;
}
