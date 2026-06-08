import { SolarsApp } from "@/components/SolarsApp";
import { nlMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={nlMarket} />;
}
