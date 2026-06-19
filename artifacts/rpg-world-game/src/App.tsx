import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameProvider, useGame } from "@/store/gameContext";
import { Toaster } from "@/components/ui/toaster";
import { WebGLErrorBoundary } from "@/components/WebGLErrorBoundary";
import Lobby from "@/pages/Lobby";
import WorldScene from "@/pages/WorldScene";
import BattleScene from "@/pages/BattleScene";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function GameRouter() {
  const { screen } = useGame();
  if (screen === "world") return <WorldScene />;
  if (screen === "battle") return <BattleScene />;
  return <Lobby />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <WebGLErrorBoundary>
          <GameRouter />
        </WebGLErrorBoundary>
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}
