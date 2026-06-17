import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Characters from "@/pages/characters";
import CharacterNew from "@/pages/character-new";
import CharacterDetail from "@/pages/character-detail";
import Worlds from "@/pages/worlds";
import WorldDetail from "@/pages/world-detail";
import Battle from "@/pages/battle";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/characters" component={Characters} />
        <Route path="/characters/new" component={CharacterNew} />
        <Route path="/characters/:id">
          {(params) => <CharacterDetail id={Number(params.id)} />}
        </Route>
        <Route path="/worlds" component={Worlds} />
        <Route path="/worlds/:id">
          {(params) => <WorldDetail id={Number(params.id)} />}
        </Route>
        <Route path="/battle/:id">
          {(params) => <Battle id={Number(params.id)} />}
        </Route>
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
