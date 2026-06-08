import { SolarsApp } from "@/components/SolarsApp";
import { ltMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={ltMarket} />;
}
