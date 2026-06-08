import { SolarsApp } from "@/components/SolarsApp";
import { isMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={isMarket} />;
}
