import { SolarsApp } from "@/components/SolarsApp";
import { grMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={grMarket} />;
}
