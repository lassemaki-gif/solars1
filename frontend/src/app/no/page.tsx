import { SolarsApp } from "@/components/SolarsApp";
import { noMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={noMarket} />;
}
