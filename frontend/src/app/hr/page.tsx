import { SolarsApp } from "@/components/SolarsApp";
import { hrMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={hrMarket} />;
}
