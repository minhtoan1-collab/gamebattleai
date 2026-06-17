import {
  useGetBattle, useBattleAction,
  useGetCharacter, useGetNpc, useGetWorld,
  getGetCharacterQueryKey, getGetBattleQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Shield, Zap, ArrowLeft, Trophy, SkipForward, Swords, Crown, Skull, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BattleArenaScene } from "@/components/world-scene";

/* ── World theme ─────────────────────────────────────────── */
const WORLD_GRAD: Record<string, string> = {
  Nature:         "from-green-950 via-stone-950 to-black",
  "Dark Fantasy": "from-violet-950 via-slate-950 to-black",
  Dragon:         "from-red-950 via-orange-950 to-black",
  Steampunk:      "from-amber-950 via-zinc-950 to-black",
  Mythic:         "from-yellow-950 via-indigo-950 to-black",
};
const WORLD_ACCENT: Record<string, string> = {
  Nature: "#4ade80", "Dark Fantasy": "#c084fc",
  Dragon: "#fb923c", Steampunk: "#fbbf24", Mythic: "#fde68a",
};
const WORLD_GLOW: Record<string, string> = {
  Nature: "rgba(74,222,128,0.25)", "Dark Fantasy": "rgba(192,132,252,0.25)",
  Dragon: "rgba(251,146,60,0.25)", Steampunk: "rgba(251,191,36,0.25)", Mythic: "rgba(253,230,138,0.25)",
};

/* ── Class sprites ─────────────────────────────────────────── */
const CLASS_EMOJI: Record<string, string> = {
  "Chiến Binh": "⚔️", "Pháp Sư": "🔮", "Thích Khách": "🗡️", "Cung Thủ": "🏹",
};
const CLASS_COLOR: Record<string, string> = {
  "Chiến Binh": "#ff4040", "Pháp Sư": "#7070ff", "Thích Khách": "#c070ff", "Cung Thủ": "#40c060",
};
function npcEmoji(type: string, isBoss: boolean) {
  if (isBoss) return "👹";
  const map: Record<string, string> = { Beast:"🐺", Undead:"💀", Elemental:"🔥", Mechanical:"🤖", Divine:"👼", Human:"🧝" };
  return map[type] ?? "👾";
}

/* ── Actions ───────────────────────────────────────────────── */
const ACTIONS = [
  { key: "attack"  as const, label: "TẤN CÔNG",  emoji: "⚔️", desc: "Bình thường",   bg: "rgba(220,38,38,0.15)",  border: "#dc2626", glow: "rgba(220,38,38,0.4)"  },
  { key: "skill"   as const, label: "KỸ NĂNG",   emoji: "⚡", desc: "×1.8 sát thương", bg: "rgba(59,130,246,0.15)", border: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
  { key: "defend"  as const, label: "PHÒNG THỦ", emoji: "🛡️", desc: "Giảm 50% dmg",  bg: "rgba(34,197,94,0.15)", border: "#22c55e", glow: "rgba(34,197,94,0.4)"  },
  { key: "flee"    as const, label: "TẨU THOÁT", emoji: "💨", desc: "50% thành công", bg: "rgba(161,161,170,0.1)", border: "#71717a", glow: "rgba(113,113,122,0.3)" },
];

/* ── HP bar ────────────────────────────────────────────────── */
function HpBar({ current, max, color, glow }: { current: number; max: number; color: string; glow: string }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (current / max) * 100 : 0));
  const low = pct < 25;
  return (
    <div className="w-full h-5 rounded-sm relative overflow-hidden" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div
        className="h-full rounded-sm transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: low ? `0 0 12px ${glow}, 0 0 24px ${glow}` : `0 0 6px ${glow}`,
          animation: low ? "pulse 1s ease-in-out infinite" : undefined,
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white/90 select-none tracking-wider">
        {current} / {max}
      </span>
    </div>
  );
}

/* ── Floating damage ───────────────────────────────────────── */
function DmgFloat({ value, crit, side }: { value: number; crit?: boolean; side: "left" | "right" }) {
  return (
    <div
      className="absolute pointer-events-none select-none font-black"
      style={{
        top: "20%",
        [side]: "10%",
        fontSize: crit ? "3rem" : "2rem",
        color: crit ? "#ff4040" : "#ffd700",
        textShadow: crit ? "0 0 20px #ff000099, 0 0 40px #ff000066" : "0 0 12px #ffd70099",
        animation: "floatUp 1.4s ease-out forwards",
        zIndex: 30,
      }}
    >
      {crit && <span style={{ fontSize: "0.9rem", display: "block", color: "#ff6060" }}>CHÍ MẠNG!</span>}
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

  const [attackAnim, setAttackAnim]     = useState<"player" | "enemy" | null>(null);
  const [hitAnim,    setHitAnim]        = useState<"player" | "enemy" | null>(null);
  const [dmgNum,     setDmgNum]         = useState<{ value: number; crit: boolean; type: "player" | "enemy" } | null>(null);
  const [screenFlash, setScreenFlash]   = useState<"red" | "gold" | null>(null);
  const [prevLog,    setPrevLog]        = useState<string[]>([]);
  const [shakeArena, setShakeArena]     = useState(false);

  useEffect(() => {
    if (!battle?.log || battle.log.length <= prevLog.length) return;
    const newLines = battle.log.slice(prevLog.length);
    setPrevLog(battle.log);
    for (const line of newLines) {
      const dmgMatch = line.match(/gây (\d+) sát thương/);
      const isCrit   = /CHÍ MẠNG|chí mạng/i.test(line);
      if (dmgMatch) {
        const dmg = parseInt(dmgMatch[1]);
        const isPlayerHit = line.includes(npc?.name ?? "___") && line.includes("gây");
        setHitAnim(isPlayerHit ? "player" : "enemy");
        setDmgNum({ value: dmg, crit: isCrit, type: isPlayerHit ? "player" : "enemy" });
        setScreenFlash(isPlayerHit ? "red" : "gold");
        setShakeArena(true);
        setTimeout(() => { setHitAnim(null); setDmgNum(null); setScreenFlash(null); setShakeArena(false); }, 1400);
      }
    }
  }, [battle?.log, npc?.name, prevLog.length]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battle?.log]);

  if (isLoading || !battle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6" style={{ background: "radial-gradient(ellipse at center, #150825 0%, #000 100%)" }}>
        <div className="text-6xl" style={{ animation: "idleBob 1.5s ease-in-out infinite" }}>⚔️</div>
        <div className="font-serif text-xl tracking-widest" style={{ color: "#f0c040", textShadow: "0 0 20px #f0c04066" }}>
          ĐANG TẢI TRẬN CHIẾN…
        </div>
      </div>
    );
  }
  if (!character || !npc) {
    return (
      <div className="text-center py-16" style={{ color: "#ffffff66" }}>
        <p>Không tìm thấy trận chiến.</p>
        <Link href="/worlds"><button className="mt-4 px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-white/60 transition-colors">Quay lại</button></Link>
      </div>
    );
  }

  const theme  = world?.theme ?? "Nature";
  const grad   = WORLD_GRAD[theme] ?? WORLD_GRAD["Nature"];
  const accent = WORLD_ACCENT[theme] ?? "#f0c040";
  const glow   = WORLD_GLOW[theme] ?? "rgba(240,192,64,0.25)";
  const isOver = battle.status !== "active";
  const won    = battle.status === "won";
  const lost   = battle.status === "lost";
  const fled   = battle.status === "fled";
  const charColor = CLASS_COLOR[character.class] ?? "#f0c040";
  const isBoss = npc.isBoss;

  const doAction = async (action: typeof ACTIONS[0]["key"]) => {
    setAttackAnim("player");
    setTimeout(() => setAttackAnim(null), 700);
    await battleAction.mutateAsync({ id, data: { action } });
    qc.invalidateQueries({ queryKey: getGetBattleQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(battle.characterId) });
  };

  return (
    <div
      className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${grad} overflow-hidden flex flex-col`}
      style={{ userSelect: "none" }}
    >
      {/* Background scene */}
      <BattleArenaScene theme={theme} />

      {/* Screen flash overlay */}
      {screenFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: screenFlash === "red"
              ? "radial-gradient(ellipse at center, rgba(255,0,0,0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(255,200,0,0.25) 0%, transparent 70%)",
            animation: "hitFlash 0.6s ease-out forwards",
          }}
        />
      )}

      {/* Boss red vignette */}
      {isBoss && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(180,0,0,0.25) 100%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
      }} />

      {/* ── TOP HUD ─────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 shrink-0" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        borderBottom: `1px solid ${accent}22`,
      }}>
        <Link href={`/worlds/${npc.worldId}`}>
          <button className="flex items-center gap-2 text-sm font-serif transition-all hover:opacity-100 opacity-60" style={{ color: accent }}>
            <ArrowLeft className="w-4 h-4" />
            {world?.name ?? "Thế Giới"}
          </button>
        </Link>

        <div className="flex items-center gap-2">
          {isBoss && (
            <span className="text-xs font-black tracking-widest px-2 py-0.5 rounded border animate-pulse"
              style={{ color: "#ff4040", borderColor: "#ff404066", background: "rgba(255,64,64,0.1)", fontSize: "10px" }}>
              ☠ BOSS
            </span>
          )}
          <div className="font-mono text-xs px-3 py-1 rounded" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}44`, color: accent }}>
            LƯỢT {battle.currentTurn}
          </div>
        </div>
      </div>

      {/* ── MAIN ARENA ─────────────────────────────── */}
      <div
        className="relative z-10 flex-1 flex flex-col"
        style={{ animation: shakeArena ? "hpShake 0.4s ease-in-out" : undefined }}
      >

        {/* Status title bar */}
        <div className="text-center py-2">
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: isOver ? (won ? "#4ade80" : lost ? "#ff4040" : "#aaa") : accent }}>
            {isOver
              ? won  ? "⚔️ CHIẾN THẮNG VINH QUANG!"
              : lost ? "💀 ĐÃ NGÃ XUỐNG..."
              :        "💨 ĐÃ THÁO CHẠY"
              : `⚔️ ĐANG GIAO CHIẾN — LƯỢT ${battle.currentTurn}`}
          </span>
        </div>

        {/* VS Stage */}
        <div className="relative flex-1 flex items-center justify-center min-h-[260px] px-4">

          {/* Ground line */}
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
          <div className="absolute bottom-8 left-[10%] right-[10%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`, animation: "groundPulse 3s ease-in-out infinite" }} />

          {/* Player character */}
          <div className="flex-1 flex flex-col items-center gap-3 relative">
            {dmgNum?.type === "player" && <DmgFloat value={dmgNum.value} crit={dmgNum.crit} side="right" />}

            <div
              className="text-8xl drop-shadow-2xl"
              style={{
                animation: attackAnim === "player"
                  ? "attackLunge 0.7s ease-in-out"
                  : hitAnim === "player"
                  ? "hitFlash 0.5s ease-in-out, hpShake 0.4s"
                  : "idleBob 2.5s ease-in-out infinite",
                filter: battle.characterHp <= 0
                  ? "grayscale(1) opacity(0.4)"
                  : `drop-shadow(0 0 20px ${charColor}99)`,
                fontSize: "5rem",
              }}
            >
              {CLASS_EMOJI[character.class] ?? "⚔️"}
            </div>

            <div className="w-full max-w-[180px] space-y-1.5">
              <div className="text-center">
                <span className="font-serif font-black text-sm tracking-wider" style={{ color: charColor, textShadow: `0 0 12px ${charColor}66` }}>
                  {character.name}
                </span>
              </div>
              <div className="text-center text-xs opacity-50 font-mono -mt-0.5">
                {character.class} · Cấp {character.level}
              </div>
              <HpBar current={battle.characterHp} max={character.maxHp} color={charColor} glow={`${charColor}88`} />
            </div>
          </div>

          {/* VS center */}
          <div className="flex flex-col items-center gap-3 px-4 shrink-0 pb-8">
            <div style={{ position: "relative" }}>
              <Swords className="w-10 h-10" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }} />
              {!isOver && (
                <div className="absolute -inset-3 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, animation: "pulse 2s ease-in-out infinite" }} />
              )}
            </div>
            <span className="font-black text-xs tracking-widest" style={{ color: accent + "66" }}>VS</span>
          </div>

          {/* NPC enemy */}
          <div className="flex-1 flex flex-col items-center gap-3 relative">
            {dmgNum?.type === "enemy" && <DmgFloat value={dmgNum.value} crit={dmgNum.crit} side="left" />}

            <div
              style={{
                fontSize: "5rem",
                display: "inline-block",
                transform: "scaleX(-1)",
                animation: hitAnim === "enemy"
                  ? "hitFlash 0.5s ease-in-out, hpShake 0.4s"
                  : "idleBob 3s ease-in-out 0.5s infinite",
                filter: battle.npcHp <= 0
                  ? "grayscale(1) opacity(0.3)"
                  : isBoss
                  ? "drop-shadow(0 0 24px #ff000099)"
                  : "drop-shadow(0 0 12px rgba(255,140,0,0.6))",
              }}
            >
              {npcEmoji(npc.type, isBoss)}
            </div>

            <div className="w-full max-w-[180px] space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                {isBoss && <Crown className="w-3.5 h-3.5" style={{ color: "#ff4040" }} />}
                <span className="font-serif font-black text-sm tracking-wider" style={{
                  color: isBoss ? "#ff4040" : "#fb923c",
                  textShadow: isBoss ? "0 0 16px #ff000099" : "0 0 8px rgba(251,146,60,0.5)",
                }}>
                  {npc.name}
                </span>
              </div>
              <div className="text-center text-xs opacity-50 font-mono -mt-0.5">
                {npc.type} · Cấp {npc.level}
              </div>
              <HpBar
                current={battle.npcHp}
                max={npc.maxHp ?? npc.hp}
                color={isBoss ? "#ff4040" : "#fb923c"}
                glow={isBoss ? "rgba(255,64,64,0.8)" : "rgba(251,146,60,0.6)"}
              />
            </div>
          </div>
        </div>

        {/* Reward hint */}
        {!isOver && (
          <div className="flex justify-center gap-6 py-2 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3" style={{ color: "#f0c04066" }} />
              <span style={{ color: "#f0c040aa" }}>{npc.xpReward}</span> XP
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: "#fbbf24" }}>◆</span>
              <span style={{ color: "#fbbf24aa" }}>{npc.goldReward}</span> gold
            </span>
          </div>
        )}

        {/* ── RESULT OVERLAY ─────────────────────── */}
        {isOver && (
          <div className="mx-4 mb-4 rounded-xl p-6 text-center relative overflow-hidden"
            style={{
              background: won  ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(0,0,0,0.7))"
                        : lost ? "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(0,0,0,0.7))"
                        :        "rgba(0,0,0,0.5)",
              border: won  ? "2px solid rgba(74,222,128,0.5)"
                    : lost ? "2px solid rgba(220,38,38,0.5)"
                    :        "1px solid rgba(255,255,255,0.1)",
              boxShadow: won  ? "0 0 40px rgba(74,222,128,0.2), inset 0 0 40px rgba(74,222,128,0.05)"
                        : lost ? "0 0 40px rgba(220,38,38,0.2), inset 0 0 40px rgba(220,38,38,0.05)"
                        : undefined,
            }}
          >
            {won && (
              <>
                <div className="text-6xl mb-3" style={{ animation: "rise 0.6s ease-out, idleBob 2s ease-in-out 0.6s infinite" }}>🏆</div>
                <p className="font-serif font-black text-3xl mb-2 uppercase tracking-widest" style={{ color: "#4ade80", textShadow: "0 0 30px rgba(74,222,128,0.6)" }}>
                  CHIẾN THẮNG!
                </p>
                <div className="flex justify-center gap-6 mt-3 text-sm">
                  <span className="font-bold" style={{ color: "#f0c040" }}>+{battle.xpGained} XP</span>
                  <span className="font-bold" style={{ color: "#fbbf24" }}>+{battle.goldGained} Gold</span>
                </div>
              </>
            )}
            {lost && (
              <>
                <div className="text-6xl mb-3" style={{ animation: "rise 0.6s ease-out" }}>💀</div>
                <p className="font-serif font-black text-3xl mb-2 uppercase tracking-widest" style={{ color: "#ff4040", textShadow: "0 0 30px rgba(255,64,64,0.6)" }}>
                  THẤT BẠI...
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Mất 10% gold. HP về 1. Hãy thử lại!</p>
              </>
            )}
            {fled && (
              <>
                <div className="text-5xl mb-3">💨</div>
                <p className="font-serif font-bold text-xl" style={{ color: "rgba(255,255,255,0.6)" }}>Đã tháo chạy an toàn.</p>
              </>
            )}
            <div className="flex gap-3 justify-center mt-5">
              <Link href={`/worlds/${npc.worldId}`}>
                <button className="px-5 py-2.5 rounded-lg font-serif text-sm uppercase tracking-wider font-bold border-2 transition-all hover:opacity-80"
                  style={{ borderColor: accent, color: accent, background: "transparent" }}>
                  Tiếp Tục Khám Phá
                </button>
              </Link>
              {won && (
                <Link href={`/characters/${battle.characterId}`}>
                  <button className="px-5 py-2.5 rounded-lg font-serif text-sm uppercase tracking-wider font-black transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #f0c040, #c09030)", color: "#000" }}>
                    Xem Nhân Vật
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ─────────────────────── */}
        {!isOver && (
          <div
            className="shrink-0 px-3 pb-3 pt-2"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
          >
            <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
              {ACTIONS.map(a => (
                <button
                  key={a.key}
                  onClick={() => doAction(a.key)}
                  disabled={battleAction.isPending}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-150 active:scale-95 select-none"
                  style={{
                    background: battleAction.isPending ? "rgba(255,255,255,0.03)" : a.bg,
                    border: `2px solid ${battleAction.isPending ? "rgba(255,255,255,0.08)" : a.border}`,
                    boxShadow: battleAction.isPending ? "none" : `0 0 12px ${a.glow}`,
                    opacity: battleAction.isPending ? 0.3 : 1,
                    cursor: battleAction.isPending ? "not-allowed" : "pointer",
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{a.emoji}</span>
                  <span className="text-[11px] font-black tracking-wider text-white">{a.label}</span>
                  <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{a.desc}</span>
                </button>
              ))}
            </div>
            {battleAction.isPending && (
              <div className="text-center mt-1.5 font-mono text-xs animate-pulse" style={{ color: accent }}>
                ··· đang xử lý ···
              </div>
            )}
          </div>
        )}

        {/* ── BATTLE LOG ─────────────────────────── */}
        <div className="shrink-0 mx-3 mb-3 rounded-xl overflow-hidden"
          style={{ border: `1px solid ${accent}22`, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: `${accent}22` }}>
            <Swords className="w-3 h-3" style={{ color: accent }} />
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              Nhật Ký Chiến Đấu
            </span>
          </div>
          <div ref={logRef} className="h-32 overflow-y-auto p-2.5 space-y-1 text-xs"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            {battle.log.map((line, i) => {
              const isLatest  = i >= battle.log.length - 2;
              const isCrit    = /CHÍ MẠNG|chí mạng/i.test(line);
              const isLevel   = /LEVEL UP/i.test(line);
              const isStart   = i === 0;
              const isVictory = /bị đánh bại|ngã xuống/i.test(line);

              let color = "rgba(255,255,255,0.3)";
              if (isStart)   color = accent;
              if (isLevel)   color = "#fbbf24";
              if (isCrit)    color = "#ff6060";
              if (isVictory) color = "#4ade80";
              if (isLatest && !isCrit && !isLevel && !isVictory && !isStart) color = "rgba(255,255,255,0.85)";

              return (
                <div key={i} className="leading-relaxed flex gap-2">
                  <span className="font-mono text-[9px] shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.15)" }}>{String(i+1).padStart(2, "0")}</span>
                  <span style={{
                    color,
                    fontWeight: isCrit || isLevel || isVictory ? "bold" : undefined,
                    textShadow: isCrit ? "0 0 8px rgba(255,96,96,0.5)" : isLevel ? "0 0 8px rgba(251,191,36,0.5)" : undefined,
                  }}>
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
