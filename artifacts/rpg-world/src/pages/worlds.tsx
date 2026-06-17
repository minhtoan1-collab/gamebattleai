import { useListWorlds, useListCharacters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Globe, Lock, Users, Crown, Sword } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const THEME_ACCENTS: Record<string, string> = {
  "Nature": "border-green-700/40 hover:border-green-500/60",
  "Dark Fantasy": "border-purple-700/40 hover:border-purple-500/60",
  "Dragon": "border-red-700/40 hover:border-red-500/60",
  "Steampunk": "border-amber-700/40 hover:border-amber-500/60",
  "Mythic": "border-yellow-600/40 hover:border-yellow-400/60",
};

const THEME_LABELS: Record<string, string> = {
  "Nature": "Thiên Nhiên",
  "Dark Fantasy": "Bóng Tối",
  "Dragon": "Rồng",
  "Steampunk": "Cơ Giới",
  "Mythic": "Thần Thoại",
};

export default function Worlds() {
  const { data: worlds = [], isLoading } = useListWorlds();
  const { data: characters = [] } = useListCharacters();

  const maxLevel = characters.length > 0 ? Math.max(...characters.map((c) => c.level)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary uppercase tracking-widest">
          Thế Giới
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chọn một thế giới để khám phá và chiến đấu · Cấp cao nhất của bạn: <span className="text-secondary font-bold">{maxLevel}</span>
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {worlds.map((w) => {
            const locked = maxLevel < w.minLevel;
            const accent = THEME_ACCENTS[w.theme] ?? "border-border hover:border-primary/50";

            return (
              <div key={w.id}>
                {locked ? (
                  <Card className={`border ${accent} bg-card transition-all relative opacity-50 grayscale`}>
                    <div className="absolute inset-0 rounded-lg bg-background/30 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Yêu cầu cấp {w.minLevel}</span>
                      </div>
                    </div>
                    <WorldCard world={w} locked />
                  </Card>
                ) : (
                  <Link href={`/worlds/${w.id}`}>
                    <Card className={`border ${accent} bg-card transition-all cursor-pointer group`}>
                      <WorldCard world={w} locked={false} />
                    </Card>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorldCard({ world, locked }: { world: any; locked: boolean }) {
  const accent = THEME_ACCENTS[world.theme] ?? "";
  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={`text-base font-serif leading-tight ${locked ? "text-muted-foreground" : "text-foreground group-hover:text-secondary transition-colors"}`}>
            {world.name}
          </CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="outline" className="text-[10px] border-muted text-muted-foreground">
              {THEME_LABELS[world.theme] ?? world.theme}
            </Badge>
            {world.isBossWorld && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30 border flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" />Boss
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{world.description}</p>
        <div className="flex items-center justify-between text-xs border-t border-border pt-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Sword className="w-3 h-3 text-primary" />
            Yêu cầu: <span className="text-secondary font-bold ml-0.5">Cấp {world.minLevel}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            {world.npcCount} NPC
          </div>
        </div>
      </CardContent>
    </>
  );
}
