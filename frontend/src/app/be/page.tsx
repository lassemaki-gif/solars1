import { SolarsApp } from "@/components/SolarsApp";
import { beMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={beMarket} />;
}
