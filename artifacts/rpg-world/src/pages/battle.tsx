import { useGetBattle, useBattleAction, useGetCharacter, useGetNpc, getGetCharacterQueryKey, getGetBattleQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Shield, Zap, ArrowLeft, Swords, Trophy, SkipForward } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Battle({ id }: { id: number }) {
  const { data: battle, isLoading } = useGetBattle(id, { query: { enabled: !!id, refetchInterval: false } });
  const { data: character } = useGetCharacter(battle?.characterId ?? 0, { query: { enabled: !!battle?.characterId } });
  const { data: npc } = useGetNpc(battle?.npcId ?? 0, { query: { enabled: !!battle?.npcId } });
  const battleAction = useBattleAction();
  const qc = useQueryClient();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle?.log]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!battle || !character || !npc) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Không tìm thấy trận chiến.</p>
        <Link href="/worlds"><Button className="mt-4" variant="outline">Quay lại</Button></Link>
      </div>
    );
  }

  const charHpPercent = Math.max(0, Math.min(100, Math.round((battle.characterHp / character.maxHp) * 100)));
  const npcHpPercent = Math.max(0, Math.min(100, Math.round((battle.npcHp / (npc.maxHp ?? npc.hp)) * 100)));
  const isOver = battle.status !== "active";
  const won = battle.status === "won";
  const lost = battle.status === "lost";

  const doAction = async (action: "attack" | "skill" | "defend" | "flee") => {
    await battleAction.mutateAsync({ id, data: { action } });
    qc.invalidateQueries({ queryKey: getGetBattleQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(battle.characterId) });
  };

  const ACTIONS = [
    { key: "attack" as const, label: "Tấn Công", icon: Sword, desc: "Đòn thường" },
    { key: "skill" as const, label: "Kỹ Năng", icon: Zap, desc: "x1.8 sát thương" },
    { key: "defend" as const, label: "Phòng Thủ", icon: Shield, desc: "Giảm 50% dmg nhận" },
    { key: "flee" as const, label: "Tẩu Thoát", icon: SkipForward, desc: "50% thành công" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/worlds">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Thế Giới
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">Lượt {battle.currentTurn}</span>
      </div>

      {/* Battle Header */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-b from-primary/5 to-transparent">
          <CardTitle className="text-center font-serif text-lg text-secondary flex items-center justify-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {isOver
              ? won ? "Chien Thang!" : lost ? "That Bai..." : "Da Thoat"
              : "Dang Chien Dau"
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Combatant bars */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-serif font-bold text-foreground truncate">{character.name}</span>
                <span className={`font-bold ${battle.characterHp <= 0 ? "text-destructive" : "text-primary"}`}>
                  {battle.characterHp}/{character.maxHp}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${charHpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-overlay">
                  HP
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{character.class} · Cấp {character.level}</Badge>
            </div>

            {/* NPC */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-serif font-bold text-foreground truncate">{npc.name}</span>
                <span className={`font-bold ${battle.npcHp <= 0 ? "text-destructive" : "text-orange-400"}`}>
                  {battle.npcHp}/{npc.maxHp ?? npc.hp}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                <div
                  className="bg-orange-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${npcHpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-overlay">
                  HP
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-orange-700/40 text-orange-400">
                {npc.type} · Cấp {npc.level}
              </Badge>
            </div>
          </div>

          {/* Result Banner */}
          {isOver && (
            <div className={`rounded-lg p-4 text-center border ${won ? "bg-green-900/30 border-green-700/50" : lost ? "bg-red-900/30 border-red-700/50" : "bg-muted border-border"}`}>
              {won && (
                <div className="space-y-1">
                  <div className="flex justify-center gap-1 mb-2">
                    <Trophy className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="font-serif font-bold text-secondary text-lg">Chien Thang!</p>
                  <p className="text-sm text-muted-foreground">
                    +{battle.xpGained} XP · +{battle.goldGained} Gold
                  </p>
                </div>
              )}
              {lost && (
                <div>
                  <p className="font-serif font-bold text-destructive text-lg">That Bai...</p>
                  <p className="text-sm text-muted-foreground">Mat 10% gold. HP hoi ve 1.</p>
                </div>
              )}
              {battle.status === "fled" && (
                <p className="font-serif text-muted-foreground">Da thoat khoi tran chien.</p>
              )}
              <div className="flex gap-2 justify-center mt-4">
                <Link href="/worlds">
                  <Button size="sm" variant="outline" className="font-serif text-xs uppercase tracking-wider">
                    Chon Tran Moi
                  </Button>
                </Link>
                {won && (
                  <Link href={`/characters/${battle.characterId}`}>
                    <Button size="sm" className="font-serif text-xs uppercase tracking-wider">
                      Xem Nhan Vat
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isOver && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.key}
                    onClick={() => doAction(a.key)}
                    disabled={battleAction.isPending}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all
                      ${battleAction.isPending ? "opacity-40 cursor-not-allowed" : "hover:border-primary/60 hover:bg-primary/5 active:scale-95 cursor-pointer"}
                      border-border bg-background/40`}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold font-serif text-foreground">{a.label}</span>
                    <span className="text-[10px] text-muted-foreground">{a.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battle Log */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-serif uppercase tracking-widest text-muted-foreground">Nhat Ky Chien Dau</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logRef}
            className="h-48 overflow-y-auto space-y-1 text-xs font-mono pr-2"
          >
            {battle.log.map((line, i) => {
              const isRecent = i >= battle.log.length - 2;
              const isCrit = line.includes("CHI MANH") || line.includes("Chi manh") || line.includes("CHÍ MẠNG");
              const isLevel = line.includes("LEVEL UP");
              return (
                <div
                  key={i}
                  className={`py-0.5 transition-colors ${
                    isLevel ? "text-secondary font-bold" :
                    isCrit ? "text-primary" :
                    isRecent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/40 mr-2">{i + 1}.</span>
                  {line}
                </div>
              );
            })}
            {battleAction.isPending && (
              <div className="text-muted-foreground animate-pulse">...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
