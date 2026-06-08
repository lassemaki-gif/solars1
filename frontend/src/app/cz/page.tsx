import { SolarsApp } from "@/components/SolarsApp";
import { czMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={czMarket} />;
}
