import { SolarsApp } from "@/components/SolarsApp";
import { seMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={seMarket} />;
}
