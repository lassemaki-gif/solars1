import { SolarsApp } from "@/components/SolarsApp";
import { huMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={huMarket} />;
}
