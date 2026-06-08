import { SolarsApp } from "@/components/SolarsApp";
import { ptMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={ptMarket} />;
}
