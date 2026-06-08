import { SolarsApp } from "@/components/SolarsApp";
import { fiMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={fiMarket} />;
}
