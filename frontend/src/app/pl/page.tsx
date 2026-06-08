import { SolarsApp } from "@/components/SolarsApp";
import { plMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={plMarket} />;
}
