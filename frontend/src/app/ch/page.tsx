import { SolarsApp } from "@/components/SolarsApp";
import { chMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={chMarket} />;
}
