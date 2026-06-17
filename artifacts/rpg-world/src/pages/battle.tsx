import {
  useGetBattle, useBattleAction,
  useGetCharacter, useGetNpc, useGetWorld,
  getGetCharacterQueryKey, getGetBattleQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Shield, Zap, ArrowLeft, Trophy, SkipForward, Swords, Crown, Skull, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BattleArenaScene } from "@/components/world-scene";

/* ── Theme ─────────────────────────────────────────────────── */
const WORLD_GRAD: Record<string, string> = {
  Nature:         "from-green-950 via-stone-950 to-background",
  "Dark Fantasy": "from-violet-950 via-slate-950 to-background",
  Dragon:         "from-red-950 via-orange-950 to-background",
  Steampunk:      "from-amber-950 via-zinc-950 to-background",
  Mythic:         "from-yellow-950 via-indigo-950 to-background",
};
const WORLD_ACCENT: Record<string, string> = {
  Nature: "text-green-400", "Dark Fantasy": "text-purple-400",
  Dragon: "text-orange-400", Steampunk: "text-amber-400", Mythic: "text-yellow-400",
};
const WORLD_BORDER: Record<string, string> = {
  Nature: "border-green-800/40", "Dark Fantasy": "border-purple-800/40",
  Dragon: "border-red-800/40", Steampunk: "border-amber-800/40", Mythic: "border-yellow-700/40",
};

/* ── Class sprites ─────────────────────────────────────────── */
const CLASS_EMOJI: Record<string, string> = {
  "Chiến Binh": "⚔️", "Pháp Sư": "🔮", "Thích Khách": "🗡️", "Cung Thủ": "🏹",
};
function npcEmoji(type: string, isBoss: boolean) {
  if (isBoss) return "👹";
  const map: Record<string, string> = { Beast:"🐺", Undead:"💀", Elemental:"🔥", Mechanical:"🤖", Divine:"👼", Human:"🧝" };
  return map[type] ?? "👾";
}

/* ── Actions ───────────────────────────────────────────────── */
const ACTIONS = [
  { key: "attack"  as const, label: "Tấn Công",  icon: Sword,       desc: "Đòn bình thường",   border: "border-red-700/60 hover:bg-red-900/30 hover:border-red-500"      },
  { key: "skill"   as const, label: "Kỹ Năng",   icon: Zap,         desc: "×1.8 sát thương",   border: "border-blue-700/60 hover:bg-blue-900/30 hover:border-blue-500"   },
  { key: "defend"  as const, label: "Phòng Thủ", icon: Shield,      desc: "Giảm 50% dmg",      border: "border-green-700/60 hover:bg-green-900/30 hover:border-green-500" },
  { key: "flee"    as const, label: "Tẩu Thoát", icon: SkipForward, desc: "50% thành công",    border: "border-zinc-700/60 hover:bg-zinc-800/40 hover:border-zinc-500"   },
];

/* ── HP bar ────────────────────────────────────────────────── */
function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (current / max) * 100 : 0));
  return (
    <div className="w-full bg-white/10 rounded-full h-4 relative overflow-hidden backdrop-blur">
      <div className={`h-4 rounded-full transition-all duration-700 ${color} ${pct < 25 ? "animate-pulse" : ""}`}
        style={{ width: `${pct}%` }} />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white/90 mix-blend-overlay select-none">
        {current} / {max}
      </span>
    </div>
  );
}

/* ── Floating damage number ────────────────────────────────── */
function DamageNumber({ value, type }: { value: number | null; type: "player" | "enemy" }) {
  if (!value) return null;
  return (
    <div
      className={`absolute text-xl font-black pointer-events-none select-none ${type === "player" ? "right-2 text-primary" : "left-2 text-orange-400"}`}
      style={{ top: "50%", animation: "floatUp 1.2s ease-out forwards" }}
    >
      -{value}
    </div>
  );
}

export default function Battle({ id }: { id: number }) {
  const { data: battle, isLoading } = useGetBattle(id, { query: { enabled: !!id } });
  const { data: character } = useGetCharacter(battle?.characterId ?? 0, { query: { enabled: !!battle?.characterId } });
  const { data: npc } = useGetNpc(battle?.npcId ?? 0, { query: { enabled: !!battle?.npcId } });
  const { data: world } = useGetWorld(npc?.worldId ?? 0, { query: { enabled: !!npc?.worldId } });

  const battleAction = useBattleAction();
  const qc = useQueryClient();
  const logRef = useRef<HTMLDivElement>(null);

  // Animation state
  const [attackAnim, setAttackAnim] = useState<"player" | "enemy" | null>(null);
  const [hitAnim,    setHitAnim]    = useState<"player" | "enemy" | null>(null);
  const [dmgNum,     setDmgNum]     = useState<{ value: number; type: "player" | "enemy" } | null>(null);
  const [prevLog,    setPrevLog]    = useState<string[]>([]);

  // Parse damage from latest log line
  useEffect(() => {
    if (!battle?.log || battle.log.length <= prevLog.length) return;
    const newLines = battle.log.slice(prevLog.length);
    setPrevLog(battle.log);

    for (const line of newLines) {
      const dmgMatch = line.match(/gây (\d+) sát thương/);
      if (dmgMatch) {
        const dmg = parseInt(dmgMatch[1]);
        // Determine who took the hit
        const isPlayerHit = line.includes(npc?.name ?? "___") && line.includes("gây");
        setHitAnim(isPlayerHit ? "player" : "enemy");
        setDmgNum({ value: dmg, type: isPlayerHit ? "player" : "enemy" });
        setTimeout(() => { setHitAnim(null); setDmgNum(null); }, 1200);
      }
    }
  }, [battle?.log, npc?.name, prevLog.length]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battle?.log]);

  if (isLoading || !battle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Skeleton className="h-48 w-full max-w-xl" />
        <Skeleton className="h-28 w-full max-w-xl" />
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

  const theme   = world?.theme ?? "Nature";
  const grad    = WORLD_GRAD[theme] ?? WORLD_GRAD["Nature"];
  const accent  = WORLD_ACCENT[theme] ?? "text-foreground";
  const border  = WORLD_BORDER[theme] ?? "border-border";
  const isOver  = battle.status !== "active";
  const won     = battle.status === "won";
  const lost    = battle.status === "lost";

  const doAction = async (action: typeof ACTIONS[0]["key"]) => {
    setAttackAnim("player");
    setTimeout(() => setAttackAnim(null), 700);
    await battleAction.mutateAsync({ id, data: { action } });
    qc.invalidateQueries({ queryKey: getGetBattleQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(battle.characterId) });
  };

  return (
    <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${grad} overflow-hidden flex flex-col`}>
      <BattleArenaScene theme={theme} />

      {/* Top bar */}
      <div className="relative z-10 sticky top-16 bg-black/40 backdrop-blur border-b border-white/5 px-4 py-2 flex items-center justify-between shrink-0">
        <Link href={`/worlds/${npc.worldId}`}>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className={`font-serif font-bold ${accent}`}>{world?.name ?? "Thế Giới"}</span>
          </button>
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Swords className="w-3.5 h-3.5 text-primary" />
          <span>Lượt <span className="text-white font-bold">{battle.currentTurn}</span></span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-5 gap-4">

        {/* ── Arena ────────────────────────────────────────── */}
        <div className={`rounded-2xl border-2 ${border} bg-black/50 backdrop-blur overflow-hidden`}>

          {/* Scene title */}
          <div className={`px-4 py-2 border-b border-white/5 text-center text-xs font-mono uppercase tracking-widest ${accent}`}>
            {isOver
              ? won ? "⚔️ Chiến Thắng!" : lost ? "💀 Thất Bại..." : "🌬 Đã Thoát"
              : `⚔️ Lượt ${battle.currentTurn} — Đang Chiến Đấu`}
          </div>

          {/* VS scene */}
          <div className="relative px-4 py-6">
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />
            <div className="absolute bottom-2 left-8 right-8 h-px bg-white/5 rounded-full" style={{ animation: "groundPulse 3s ease-in-out infinite" }} />

            <div className="flex items-end justify-between gap-4 relative">
              {/* Player */}
              <div className="flex-1 text-center relative">
                {dmgNum?.type === "player" && <DamageNumber value={dmgNum.value} type="player" />}
                <div
                  className="text-7xl mb-3 inline-block"
                  style={{
                    animation: attackAnim === "player"
                      ? "attackLunge 0.7s ease-in-out"
                      : hitAnim === "player"
                      ? "hitFlash 0.5s ease-in-out, hpShake 0.4s ease-in-out"
                      : "idleBob 2.5s ease-in-out infinite",
                    filter: battle.characterHp <= 0 ? "grayscale(1) opacity(0.5)" : undefined,
                  }}
                >
                  {CLASS_EMOJI[character.class] ?? "⚔️"}
                </div>
                <div className="space-y-1 max-w-[160px] mx-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-white/90 truncate max-w-[100px]">{character.name}</span>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-1 shrink-0">{character.class}</Badge>
                  </div>
                  <HpBar current={battle.characterHp} max={character.maxHp} color="bg-primary" />
                  <div className="text-[10px] text-white/30 text-left">Cấp {character.level}</div>
                </div>
              </div>

              {/* VS Center */}
              <div className="flex flex-col items-center gap-2 pb-8 shrink-0">
                <Swords className="w-8 h-8 text-primary/60" />
                <span className="text-xs text-white/20 font-bold">VS</span>
              </div>

              {/* NPC */}
              <div className="flex-1 text-center relative">
                {dmgNum?.type === "enemy" && <DamageNumber value={dmgNum.value} type="enemy" />}
                <div
                  className="text-7xl mb-3 inline-block"
                  style={{
                    animation: hitAnim === "enemy"
                      ? "hitFlash 0.5s ease-in-out, hpShake 0.4s ease-in-out"
                      : "idleBob 3s ease-in-out 0.5s infinite",
                    filter: battle.npcHp <= 0 ? "grayscale(1) opacity(0.4)" : undefined,
                    transform: "scaleX(-1)",
                    display: "inline-block",
                  }}
                >
                  {npcEmoji(npc.type, npc.isBoss)}
                </div>
                <div className="space-y-1 max-w-[160px] mx-auto">
                  <div className="flex items-center justify-between text-xs">
                    {npc.isBoss && <Crown className="w-3 h-3 text-primary shrink-0" />}
                    <span className={`font-serif font-bold truncate max-w-[110px] ${npc.isBoss ? "text-primary" : "text-orange-300"}`}>{npc.name}</span>
                    <Badge variant="outline" className="text-[10px] border-orange-700/40 text-orange-400 ml-1 shrink-0">{npc.type}</Badge>
                  </div>
                  <HpBar current={battle.npcHp} max={npc.maxHp ?? npc.hp} color="bg-orange-600" />
                  <div className="text-[10px] text-white/30 text-left">Cấp {npc.level}</div>
                </div>
              </div>
            </div>

            {/* Rewards hint */}
            {!isOver && (
              <div className="flex justify-center gap-4 mt-3 text-xs text-white/30">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-secondary/60" />{npc.xpReward} XP</span>
                <span className="flex items-center gap-1"><span className="text-amber-500/60">G</span>{npc.goldReward} gold</span>
              </div>
            )}
          </div>

          {/* Result */}
          {isOver && (
            <div className={`mx-4 mb-4 rounded-xl p-5 text-center border ${won ? "border-green-600/50 bg-green-900/30" : lost ? "border-red-600/50 bg-red-900/30" : "border-white/10 bg-black/30"}`}>
              {won && (
                <>
                  <Trophy className="w-10 h-10 text-secondary mx-auto mb-2" />
                  <p className="font-serif font-bold text-2xl text-secondary mb-1">Chiến Thắng!</p>
                  <p className="text-white/60 text-sm">
                    +<span className="text-secondary font-bold">{battle.xpGained} XP</span>
                    {" · "}+<span className="text-amber-400 font-bold">{battle.goldGained} gold</span>
                  </p>
                </>
              )}
              {lost && (
                <>
                  <Skull className="w-10 h-10 text-destructive mx-auto mb-2" />
                  <p className="font-serif font-bold text-2xl text-destructive mb-1">Thất Bại…</p>
                  <p className="text-white/50 text-sm">Mất 10% gold. HP về 1. Hãy thử lại!</p>
                </>
              )}
              {battle.status === "fled" && (
                <>
                  <SkipForward className="w-10 h-10 text-white/40 mx-auto mb-2" />
                  <p className="font-serif text-white/70">Đã thoát khỏi trận chiến.</p>
                </>
              )}
              <div className="flex gap-3 justify-center mt-4">
                <Link href={`/worlds/${npc.worldId}`}>
                  <Button variant="outline" className={`font-serif uppercase tracking-wider border-current ${accent}`}>
                    Tiếp Tục Khám Phá
                  </Button>
                </Link>
                {won && (
                  <Link href={`/characters/${battle.characterId}`}>
                    <Button className="font-serif uppercase tracking-wider">Xem Nhân Vật</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        {!isOver && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  onClick={() => doAction(a.key)}
                  disabled={battleAction.isPending}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150 select-none backdrop-blur bg-black/30
                    ${battleAction.isPending ? "opacity-30 cursor-not-allowed border-white/10" : `cursor-pointer active:scale-95 ${a.border}`}`}
                >
                  <Icon className="w-7 h-7 text-white/80" />
                  <div>
                    <div className="text-sm font-bold font-serif text-white">{a.label}</div>
                    <div className="text-[10px] text-white/40">{a.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Battle log ──────────────────────────────────── */}
        <div className={`rounded-2xl border-2 ${border} bg-black/40 backdrop-blur overflow-hidden`}>
          <div className={`px-4 py-2 border-b border-white/5 flex items-center gap-2`}>
            <Swords className={`w-3.5 h-3.5 ${accent}`} />
            <span className="text-xs font-mono uppercase tracking-widest text-white/30">Nhật Ký Chiến Đấu</span>
          </div>
          <div ref={logRef} className="h-44 overflow-y-auto p-4 space-y-1.5 text-sm">
            {battle.log.map((line, i) => {
              const isLatest  = i >= battle.log.length - 2;
              const isCrit    = /CHÍ MẠNG|chí mạng/i.test(line);
              const isLevel   = /LEVEL UP/i.test(line);
              const isStart   = i === 0;
              const isVictory = /bị đánh bại|ngã xuống/i.test(line);

              let cls = "text-white/40";
              if (isStart)   cls = `${accent} font-semibold`;
              if (isLevel)   cls = "text-secondary font-bold";
              if (isCrit)    cls = "text-primary font-bold";
              if (isVictory) cls = "text-green-400 font-bold";
              if (isLatest && !isCrit && !isLevel && !isVictory && !isStart) cls = "text-white/90";

              return (
                <div key={i} className={`leading-relaxed ${cls}`}>
                  <span className="text-white/20 text-xs mr-2 font-mono select-none">{i + 1}</span>
                  {line}
                </div>
              );
            })}
            {battleAction.isPending && (
              <div className="text-white/30 text-xs animate-pulse font-mono">··· đang xử lý ···</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
