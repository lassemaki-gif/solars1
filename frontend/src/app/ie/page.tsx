import { SolarsApp } from "@/components/SolarsApp";
import { ieMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={ieMarket} />;
}
