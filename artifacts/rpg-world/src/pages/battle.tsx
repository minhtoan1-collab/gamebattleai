import {
  useGetBattle, useBattleAction,
  useGetCharacter, useGetNpc, useGetWorld,
  getGetCharacterQueryKey, getGetBattleQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Sword, Shield, Zap, ArrowLeft, Trophy, SkipForward,
  Swords, Crown, Skull, Heart, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/* ── World theme ────────────────────────────────────────────── */
const WORLD_BG: Record<string, string> = {
  Nature:       "from-green-950 via-stone-950 to-background",
  "Dark Fantasy": "from-violet-950 via-slate-950 to-background",
  Dragon:       "from-red-950 via-orange-950 to-background",
  Steampunk:    "from-amber-950 via-zinc-950 to-background",
  Mythic:       "from-yellow-950 via-indigo-950 to-background",
};
const WORLD_ACCENT: Record<string, string> = {
  Nature: "text-green-400", "Dark Fantasy": "text-purple-400",
  Dragon: "text-orange-400", Steampunk: "text-amber-400", Mythic: "text-yellow-400",
};
const WORLD_BORDER: Record<string, string> = {
  Nature: "border-green-800/50", "Dark Fantasy": "border-purple-800/50",
  Dragon: "border-red-800/50", Steampunk: "border-amber-800/50", Mythic: "border-yellow-700/50",
};

/* ── Action config ──────────────────────────────────────────── */
const ACTIONS = [
  { key: "attack"  as const, label: "Tấn Công",   icon: Sword,      desc: "Đòn bình thường",       color: "border-red-700/60 hover:bg-red-900/30 hover:border-red-500"     },
  { key: "skill"   as const, label: "Kỹ Năng",    icon: Zap,        desc: "x1.8 sát thương",       color: "border-blue-700/60 hover:bg-blue-900/30 hover:border-blue-500"  },
  { key: "defend"  as const, label: "Phòng Thủ",  icon: Shield,     desc: "Giảm 50% dmg",          color: "border-green-700/60 hover:bg-green-900/30 hover:border-green-500"},
  { key: "flee"    as const, label: "Tẩu Thoát",  icon: SkipForward,desc: "50% thành công",        color: "border-zinc-700/60 hover:bg-zinc-800/40 hover:border-zinc-500"  },
];

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (current / max) * 100 : 0));
  const dangerClass = pct < 25 ? "animate-pulse" : "";
  return (
    <div className="w-full bg-muted/50 rounded-full h-5 relative overflow-hidden">
      <div
        className={`h-5 rounded-full transition-all duration-700 ${color} ${dangerClass}`}
        style={{ width: `${pct}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90 mix-blend-overlay select-none">
        {current} / {max}
      </span>
    </div>
  );
}

export default function Battle({ id }: { id: number }) {
  const { data: battle, isLoading } = useGetBattle(id, { query: { enabled: !!id } });
  const { data: character } = useGetCharacter(
    battle?.characterId ?? 0, { query: { enabled: !!battle?.characterId } }
  );
  const { data: npc } = useGetNpc(
    battle?.npcId ?? 0, { query: { enabled: !!battle?.npcId } }
  );

  // Fetch NPC's world for theming
  const npcWorldId = npc?.worldId ?? 0;
  const { data: world } = useGetWorld(npcWorldId, { query: { enabled: !!npcWorldId } });

  const battleAction = useBattleAction();
  const qc = useQueryClient();
  const logRef = useRef<HTMLDivElement>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  // auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle?.log]);

  if (isLoading || !battle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] space-y-4 flex-col">
        <Skeleton className="h-48 w-full max-w-xl" />
        <Skeleton className="h-24 w-full max-w-xl" />
      </div>
    );
  }

  if (!character || !npc) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Không tìm thấy trận chiến.</p>
        <Link href="/worlds"><Button className="mt-4" variant="outline">Quay lại</Button></Link>
      </div>
    );
  }

  const theme = world?.theme ?? "Nature";
  const bg = WORLD_BG[theme] ?? WORLD_BG["Nature"];
  const accent = WORLD_ACCENT[theme] ?? "text-foreground";
  const themeBorder = WORLD_BORDER[theme] ?? "border-border";

  const isOver = battle.status !== "active";
  const won    = battle.status === "won";
  const lost   = battle.status === "lost";

  const doAction = async (action: typeof ACTIONS[0]["key"]) => {
    setLastAction(action);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    await battleAction.mutateAsync({ id, data: { action } });
    qc.invalidateQueries({ queryKey: getGetBattleQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(battle.characterId) });
  };

  return (
    <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${bg} overflow-hidden flex flex-col`}>
      {/* Subtle fog */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 sticky top-16 bg-black/40 backdrop-blur border-b border-white/5 px-4 py-2 flex items-center justify-between">
        <Link href={`/worlds/${npcWorldId}`}>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className={`font-serif font-bold ${accent}`}>{world?.name ?? "Thế Giới"}</span>
          </button>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Swords className="w-3.5 h-3.5 text-primary" />
          <span>Lượt <span className="text-foreground font-bold">{battle.currentTurn}</span></span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-5">

        {/* ── Combatant face-off ─────────────────────────────── */}
        <div className={`rounded-2xl border-2 ${themeBorder} bg-black/40 backdrop-blur p-5 space-y-5`}>

          {/* VS Banner */}
          <div className="text-center">
            <span className={`text-xs font-mono uppercase tracking-widest ${accent}`}>
              {isOver
                ? won ? "Chien Thang!" : lost ? "That Bai..." : battle.status === "fled" ? "Da Thoat" : ""
                : `Luot ${battle.currentTurn} — Dang Chien Dau`}
            </span>
          </div>

          {/* Player side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary shrink-0" />
                <span className="font-serif font-bold text-foreground">{character.name}</span>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{character.class}</Badge>
                <span className="text-xs text-muted-foreground">Cấp {character.level}</span>
              </div>
              <span className={`text-sm font-bold ${battle.characterHp <= 0 ? "text-destructive" : "text-primary"}`}>
                {battle.characterHp} HP
              </span>
            </div>
            <HpBar current={battle.characterHp} max={character.maxHp} color="bg-primary" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <Swords className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* NPC side */}
          <div className={`space-y-2 ${shaking && lastAction ? "animate-bounce" : ""}`}
            style={{ animationDuration: "0.15s", animationIterationCount: shaking ? 3 : 0 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {npc.isBoss ? <Crown className="w-4 h-4 text-primary shrink-0" /> : <Skull className="w-4 h-4 text-orange-400 shrink-0" />}
                <span className={`font-serif font-bold ${npc.isBoss ? "text-primary" : "text-orange-300"}`}>{npc.name}</span>
                <Badge variant="outline" className="text-[10px] border-orange-700/40 text-orange-400">{npc.type}</Badge>
                <span className="text-xs text-muted-foreground">Cấp {npc.level}</span>
              </div>
              <span className={`text-sm font-bold ${battle.npcHp <= 0 ? "text-destructive" : "text-orange-400"}`}>
                {battle.npcHp} HP
              </span>
            </div>
            <HpBar current={battle.npcHp} max={npc.maxHp ?? npc.hp} color="bg-orange-600" />
          </div>

          {/* Rewards preview (if not over) */}
          {!isOver && (
            <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-secondary" />{npc.xpReward} XP</span>
              <span className="flex items-center gap-1"><span className="text-amber-400">G</span>{npc.goldReward} gold</span>
            </div>
          )}
        </div>

        {/* ── Result ─────────────────────────────────────────── */}
        {isOver && (
          <div className={`rounded-2xl border-2 p-6 text-center space-y-3
            ${won  ? "border-green-600/60 bg-green-900/20" :
              lost ? "border-red-600/60 bg-red-900/20" :
                     "border-border bg-card/40"}`}>
            {won && (
              <>
                <Trophy className="w-12 h-12 text-secondary mx-auto" />
                <p className="font-serif font-bold text-2xl text-secondary">Chien Thang!</p>
                <p className="text-muted-foreground text-sm">
                  +<span className="text-secondary font-bold">{battle.xpGained} XP</span>
                  {" "}·{" "}
                  +<span className="text-amber-400 font-bold">{battle.goldGained} gold</span>
                </p>
              </>
            )}
            {lost && (
              <>
                <Skull className="w-12 h-12 text-destructive mx-auto" />
                <p className="font-serif font-bold text-2xl text-destructive">That Bai...</p>
                <p className="text-muted-foreground text-sm">Mat 10% gold. HP hoi ve 1. Hay thu lai!</p>
              </>
            )}
            {battle.status === "fled" && (
              <>
                <SkipForward className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="font-serif text-foreground">Da thoat khoi tran chien.</p>
              </>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <Link href={`/worlds/${npcWorldId}`}>
                <Button variant="outline" className={`font-serif uppercase tracking-wider border-current ${accent}`}>
                  Tiep Tuc Kham Pha
                </Button>
              </Link>
              {won && (
                <Link href={`/characters/${battle.characterId}`}>
                  <Button className="font-serif uppercase tracking-wider">
                    Xem Nhan Vat
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Action buttons ──────────────────────────────────── */}
        {!isOver && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIONS.map((a) => {
              const Icon = a.icon;
              const isPending = battleAction.isPending;
              return (
                <button
                  key={a.key}
                  onClick={() => doAction(a.key)}
                  disabled={isPending}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150 select-none
                    ${isPending
                      ? "opacity-30 cursor-not-allowed border-border"
                      : `cursor-pointer active:scale-95 ${a.color}`}
                    bg-black/30 backdrop-blur`}
                >
                  <Icon className="w-6 h-6 text-foreground" />
                  <div>
                    <div className="text-sm font-bold font-serif text-foreground">{a.label}</div>
                    <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Battle Log ─────────────────────────────────────── */}
        <div className={`rounded-2xl border-2 ${themeBorder} bg-black/40 backdrop-blur overflow-hidden`}>
          <div className={`px-4 py-2 border-b ${themeBorder} flex items-center gap-2`}>
            <Swords className={`w-3.5 h-3.5 ${accent}`} />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Nhat Ky Chien Dau</span>
          </div>
          <div
            ref={logRef}
            className="h-52 overflow-y-auto p-4 space-y-1.5 text-sm"
          >
            {battle.log.map((line, i) => {
              const isLatest   = i >= battle.log.length - 2;
              const isCrit     = /CHÍ MẠNG|CHI MANH|chí mạng/i.test(line);
              const isLevel    = /LEVEL UP/i.test(line);
              const isVictory  = /bị đánh bại|đã ngã xuống/i.test(line);
              const isStart    = i === 0;

              let cls = "text-muted-foreground/70";
              if (isStart)   cls = `${accent} font-semibold`;
              if (isLevel)   cls = "text-secondary font-bold animate-pulse";
              if (isCrit)    cls = "text-primary font-bold";
              if (isVictory) cls = "text-green-400 font-bold";
              if (isLatest && !isCrit && !isLevel && !isVictory && !isStart) cls = "text-foreground";

              return (
                <div key={i} className={`leading-relaxed transition-colors ${cls}`}>
                  <span className="text-muted-foreground/30 text-xs mr-2 font-mono select-none">{i + 1}</span>
                  {line}
                </div>
              );
            })}
            {battleAction.isPending && (
              <div className="text-muted-foreground/60 text-xs animate-pulse font-mono">
                ··· đang xử lý ···
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
