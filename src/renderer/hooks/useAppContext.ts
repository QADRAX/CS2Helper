import { useContext } from "react";
import { AppContext } from "../context/Context";

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useGameState debe ser utilizado dentro de un GameStateProvider');
  }
  return context;
};
