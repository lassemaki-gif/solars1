import { SolarsApp } from "@/components/SolarsApp";
import { roMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={roMarket} />;
}
