import { useGetWorld, useListWorldNpcs, useListCharacters, useStartBattle, getListBattlesQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Sword, Crown, Shield, Star, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const DIFFICULTY_STYLES: Record<string, string> = {
  "Easy": "bg-green-900/30 text-green-400 border-green-700/40",
  "Normal": "bg-blue-900/30 text-blue-400 border-blue-700/40",
  "Hard": "bg-orange-900/30 text-orange-400 border-orange-700/40",
  "Boss": "bg-red-900/30 text-red-400 border-red-700/40",
};

export default function WorldDetail({ id }: { id: number }) {
  const { data: world, isLoading } = useGetWorld(id, { query: { enabled: !!id } });
  const { data: npcs = [] } = useListWorldNpcs(id, { query: { enabled: !!id } });
  const { data: characters = [] } = useListCharacters();
  const startBattle = useStartBattle();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [selectedChar, setSelectedChar] = useState<number | null>(characters[0]?.id ?? null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!world) return (
    <div className="text-center py-16 text-muted-foreground">
      <p>Thế giới không tồn tại.</p>
      <Link href="/worlds"><Button className="mt-4" variant="outline">Quay lại</Button></Link>
    </div>
  );

  const handleFight = async (npcId: number) => {
    if (!selectedChar) return;
    const battle = await startBattle.mutateAsync({ data: { characterId: selectedChar, npcId } });
    qc.invalidateQueries({ queryKey: getListBattlesQueryKey() });
    navigate(`/battle/${battle.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/worlds">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Thế Giới
          </Button>
        </Link>
      </div>

      {/* World Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-serif text-secondary tracking-wide">{world.name}</CardTitle>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg">{world.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="border-muted text-muted-foreground">{world.theme}</Badge>
              {world.isBossWorld && (
                <Badge className="bg-primary/20 text-primary border-primary/40 border flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Boss World
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-3">
            <span>Yêu cầu cấp: <span className="text-secondary font-bold">{world.minLevel}</span></span>
            <span>Số NPC: <span className="text-foreground">{world.npcCount}</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Character Selector */}
      {characters.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-serif uppercase tracking-wider text-muted-foreground">Nhân vật chiến đấu</p>
          <div className="flex flex-wrap gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                  selectedChar === c.id
                    ? "border-secondary text-secondary bg-secondary/10"
                    : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                {c.name} <span className="opacity-60 text-xs">Cấp {c.level}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {characters.length === 0 && (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="py-6 text-center text-muted-foreground text-sm">
            Bạn cần có nhân vật để chiến đấu.{" "}
            <Link href="/characters/new" className="text-primary hover:underline">Tạo nhân vật</Link>
          </CardContent>
        </Card>
      )}

      {/* NPC List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold font-serif text-foreground uppercase tracking-widest flex items-center gap-2">
          <Sword className="w-4 h-4 text-primary" /> Kẻ Thù ({npcs.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {npcs.map((npc) => {
            const diffStyle = DIFFICULTY_STYLES[npc.difficulty] ?? DIFFICULTY_STYLES["Easy"];
            return (
              <Card key={npc.id} className={`border bg-card transition-all ${npc.isBoss ? "border-primary/40" : "border-border"}`}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-serif font-bold text-base flex items-center gap-2">
                        {npc.isBoss && <Crown className="w-4 h-4 text-primary shrink-0" />}
                        <span className={npc.isBoss ? "text-primary" : "text-foreground"}>{npc.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{npc.type} · Cấp {npc.level}</div>
                    </div>
                    <Badge className={`text-xs border ${diffStyle}`}>{npc.difficulty}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
                    <div className="bg-background/40 rounded p-1.5">
                      <Shield className="w-3.5 h-3.5 mx-auto text-primary mb-0.5" />
                      <div className="font-bold text-foreground">{npc.hp}</div>
                      <div className="text-muted-foreground">HP</div>
                    </div>
                    <div className="bg-background/40 rounded p-1.5">
                      <Star className="w-3.5 h-3.5 mx-auto text-secondary mb-0.5" />
                      <div className="font-bold text-secondary">{npc.xpReward}</div>
                      <div className="text-muted-foreground">XP</div>
                    </div>
                    <div className="bg-background/40 rounded p-1.5">
                      <span className="text-amber-400 text-base block -mt-0.5">G</span>
                      <div className="font-bold text-amber-400">{npc.goldReward}</div>
                      <div className="text-muted-foreground">Gold</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full font-serif uppercase tracking-wider text-xs"
                    disabled={!selectedChar || startBattle.isPending}
                    onClick={() => handleFight(npc.id)}
                    variant={npc.isBoss ? "default" : "outline"}
                  >
                    <Sword className="w-3 h-3 mr-1.5" />
                    {npc.isBoss ? "Thách Đấu Boss" : "Chiến Đấu"}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
