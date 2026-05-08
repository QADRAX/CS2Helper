import type { BenchCliApp } from "../infrastructure/bench";
import { InteractiveBenchCli } from "./components";

export interface AppProps {
  benchApp: BenchCliApp;
}

/** Root presentation entry for the GSI bench CLI. */
export function App({ benchApp }: AppProps) {
  return <InteractiveBenchCli benchApp={benchApp} />;
}
