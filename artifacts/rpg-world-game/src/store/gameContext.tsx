import React, { createContext, useContext, useState, useCallback } from "react";
import type { Character, World, Npc } from "@workspace/api-client-react";

type GameScreen = "lobby" | "world" | "battle";

interface GameState {
  screen: GameScreen;
  character: Character | null;
  world: World | null;
  targetNpc: Npc | null;
  battleId: number | null;
}

interface GameContextValue extends GameState {
  selectCharacter: (c: Character) => void;
  enterWorld: (w: World) => void;
  startBattle: (npc: Npc, battleId: number) => void;
  endBattle: () => void;
  goLobby: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    screen: "lobby",
    character: null,
    world: null,
    targetNpc: null,
    battleId: null,
  });

  const selectCharacter = useCallback((c: Character) => {
    setState((s) => ({ ...s, character: c }));
  }, []);

  const enterWorld = useCallback((w: World) => {
    setState((s) => ({ ...s, world: w, screen: "world" }));
  }, []);

  const startBattle = useCallback((npc: Npc, battleId: number) => {
    setState((s) => ({ ...s, targetNpc: npc, battleId, screen: "battle" }));
  }, []);

  const endBattle = useCallback(() => {
    setState((s) => ({ ...s, screen: "world", targetNpc: null, battleId: null }));
  }, []);

  const goLobby = useCallback(() => {
    setState({ screen: "lobby", character: null, world: null, targetNpc: null, battleId: null });
  }, []);

  return (
    <GameContext.Provider value={{ ...state, selectCharacter, enterWorld, startBattle, endBattle, goLobby }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
