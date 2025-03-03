import React, { createContext, ReactNode, useMemo } from "react";
import { useBackendData } from "../hooks/useBackendData";
import { GameState } from "../../types/CSGO";
import { MatchData } from "../../types/CSState";

interface AppContextType {
  gameState: GameState | null;
  matchData: MatchData | null;
}

export const AppContext = createContext<AppContextType>({
  gameState: null,
  matchData: null,
});

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const gameState = useBackendData('game-state');
  const matchData = useBackendData('match-state');

  const contextState: AppContextType = useMemo(() => {
    return {
      gameState,
      matchData,
    }
  }, [gameState, matchData]);

  return (
    <AppContext.Provider value={contextState}>
      {children}
    </AppContext.Provider>
  );
};
