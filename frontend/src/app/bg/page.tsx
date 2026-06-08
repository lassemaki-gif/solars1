import { SolarsApp } from "@/components/SolarsApp";
import { bgMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={bgMarket} />;
}
