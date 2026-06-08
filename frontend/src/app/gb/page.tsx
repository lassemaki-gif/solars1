import { SolarsApp } from "@/components/SolarsApp";
import { gbMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={gbMarket} />;
}
