import { SolarsApp } from "@/components/SolarsApp";
import { skMarket } from "@/lib/market";

export default function Home() {
  return <SolarsApp config={skMarket} />;
}
