import { SolarsApp } from "@/components/SolarsApp";
import { lvMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={lvMarket} />;
}
