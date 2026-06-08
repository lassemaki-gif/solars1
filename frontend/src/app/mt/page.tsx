import { SolarsApp } from "@/components/SolarsApp";
import { mtMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={mtMarket} />;
}
