import {
  useGetBattle, useBattleAction,
  useGetCharacter, useGetNpc, useGetWorld,
  getGetCharacterQueryKey, getGetBattleQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, Swords, Crown, SkipForward, Trophy, Skull, Star, Zap, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/* ── World themes ─────────────────────────────────────── */
const THEME_BG: Record<string, string> = {
  Nature:         "linear-gradient(180deg, #0a1a0a 0%, #0f2a0f 40%, #0a1a0a 100%)",
  "Dark Fantasy": "linear-gradient(180deg, #0a0010 0%, #150025 40%, #0a0010 100%)",
  Dragon:         "linear-gradient(180deg, #1a0500 0%, #2a0a00 40%, #1a0500 100%)",
  Steampunk:      "linear-gradient(180deg, #0f0c00 0%, #1f1500 40%, #0f0c00 100%)",
  Mythic:         "linear-gradient(180deg, #05000f 0%, #0f0020 40%, #05000f 100%)",
};
const THEME_FOG: Record<string, string> = {
  Nature: "#00ff6622", "Dark Fantasy": "#8800ff22", Dragon: "#ff440022",
  Steampunk: "#ffaa0022", Mythic: "#aa00ff22",
};
const THEME_ACCENT: Record<string, string> = {
  Nature: "#4ade80", "Dark Fantasy": "#c084fc", Dragon: "#fb923c",
  Steampunk: "#fbbf24", Mythic: "#fde68a",
};

/* ── Class art ─────────────────────────────────────────── */
const CLASS_COLOR: Record<string, string> = {
  "Chiến Binh": "#ff4040", "Pháp Sư": "#8888ff", "Thích Khách": "#cc44ff", "Cung Thủ": "#44cc66",
};
const CLASS_GLOW: Record<string, string> = {
  "Chiến Binh": "#ff000088", "Pháp Sư": "#4444ff88", "Thích Khách": "#aa00ff88", "Cung Thủ": "#00ff4488",
};

type CharClass = "Chiến Binh" | "Pháp Sư" | "Thích Khách" | "Cung Thủ";

/* ── Stylized character art using CSS ─────────────────── */
function CharacterArt({ cls, flip = false, dead = false, anim }: {
  cls: string; flip?: boolean; dead?: boolean; anim?: "attack" | "hit" | "idle" | null;
}) {
  const color = CLASS_COLOR[cls] ?? "#f0c040";
  const glow  = CLASS_GLOW[cls]  ?? "#f0c04088";

  const configs: Record<string, { body: string; weapon: string; aura: string }> = {
    "Chiến Binh":  { body: "⚔️", weapon: "🗡️", aura: "🔴" },
    "Pháp Sư":    { body: "🔮", weapon: "✨", aura: "💜" },
    "Thích Khách":{ body: "🗡️", weapon: "⚡", aura: "🟣" },
    "Cung Thủ":   { body: "🏹", weapon: "💚", aura: "🟢" },
  };
  const c = configs[cls] ?? configs["Chiến Binh"];
  void c;

  const animStyle = anim === "attack"
    ? { animation: `${flip ? "attackLungeRight" : "attackLunge"} 0.65s ease-in-out` }
    : anim === "hit"
    ? { animation: "hitShake 0.4s ease-in-out, hitFlash 0.4s ease-in-out" }
    : { animation: "idleBob 2.5s ease-in-out infinite" };

  return (
    <div className="flex flex-col items-center" style={{ opacity: dead ? 0.3 : 1, filter: dead ? "grayscale(1)" : "none" }}>
      {/* Aura ring */}
      <div className="relative flex items-end justify-center" style={{ width: 160, height: 200 }}>
        {/* Outer aura */}
        <div style={{
          position: "absolute",
          bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          animation: "pulse 2s ease-in-out infinite",
          zIndex: 0,
        }} />

        {/* Ground shadow ellipse */}
        <div style={{
          position: "absolute",
          bottom: -8,
          left: "50%", transform: "translateX(-50%)",
          width: 100, height: 20,
          background: `radial-gradient(ellipse, ${color}66 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "groundPulse 2s ease-in-out infinite",
          zIndex: 0,
        }} />

        {/* Main character emoji — very large */}
        <div style={{
          position: "relative",
          zIndex: 1,
          fontSize: "8rem",
          lineHeight: 1,
          transform: flip ? "scaleX(-1)" : "none",
          filter: `drop-shadow(0 0 16px ${color}) drop-shadow(0 0 32px ${glow})`,
          ...animStyle,
        }}>
          {cls === "Chiến Binh"  ? "⚔️"
           : cls === "Pháp Sư"   ? "🔮"
           : cls === "Thích Khách" ? "🗡️"
           : cls === "Cung Thủ"  ? "🏹"
           : "⚔️"}
        </div>
      </div>
    </div>
  );
}

function NpcArt({ type, isBoss, dead = false, anim }: {
  type: string; isBoss: boolean; dead?: boolean; anim?: "attack" | "hit" | "idle" | null;
}) {
  const color = isBoss ? "#ff2020" : "#ff8800";
  const glow  = isBoss ? "#ff000099" : "#ff880066";

  const emoji = isBoss ? "👹"
    : type === "Beast"      ? "🐺"
    : type === "Undead"     ? "💀"
    : type === "Elemental"  ? "🔥"
    : type === "Mechanical" ? "🤖"
    : type === "Divine"     ? "👼"
    : "👾";

  const animStyle = anim === "attack"
    ? { animation: "attackLungeRight 0.65s ease-in-out" }
    : anim === "hit"
    ? { animation: "hitShake 0.4s ease-in-out, hitFlash 0.4s" }
    : { animation: `idleBob ${isBoss ? "2s" : "3s"} ease-in-out infinite` };

  return (
    <div className="flex flex-col items-center" style={{ opacity: dead ? 0.25 : 1, filter: dead ? "grayscale(1)" : "none" }}>
      <div className="relative flex items-end justify-center" style={{ width: 160, height: 200 }}>
        <div style={{
          position: "absolute",
          bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: isBoss ? 160 : 110, height: isBoss ? 160 : 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          animation: `pulse ${isBoss ? "1.5s" : "2.5s"} ease-in-out infinite`,
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute",
          bottom: -8, left: "50%", transform: "translateX(-50%)",
          width: 100, height: 20,
          background: `radial-gradient(ellipse, ${color}55 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "groundPulse 2s ease-in-out infinite",
          zIndex: 0,
        }} />
        <div style={{
          position: "relative",
          zIndex: 1,
          fontSize: isBoss ? "9rem" : "7rem",
          lineHeight: 1,
          transform: "scaleX(-1)",
          filter: `drop-shadow(0 0 16px ${color}) drop-shadow(0 0 40px ${glow})`,
          ...animStyle,
        }}>
          {emoji}
        </div>
      </div>
    </div>
  );
}

/* ── Skill beam effect ────────────────────────────────── */
function SkillBeam({ active, direction, color }: { active: boolean; direction: "ltr" | "rtl"; color: string }) {
  if (!active) return null;
  return (
    <div style={{
      position: "absolute",
      top: "45%",
      left: direction === "ltr" ? "20%" : "auto",
      right: direction === "rtl" ? "20%" : "auto",
      width: "60%",
      height: 6,
      background: `linear-gradient(${direction === "ltr" ? "90deg" : "270deg"}, transparent, ${color}, ${color}ff, transparent)`,
      boxShadow: `0 0 20px ${color}, 0 0 40px ${color}88`,
      borderRadius: 3,
      animation: "beamShoot 0.5s ease-out forwards",
      zIndex: 25,
      pointerEvents: "none",
    }} />
  );
}

/* ── Damage number ───────────────────────────────────── */
function DmgNumber({ value, crit, x }: { value: number; crit: boolean; x: "left" | "center" | "right" }) {
  const posMap = { left: "15%", center: "50%", right: "75%" };
  return (
    <div style={{
      position: "absolute",
      top: "30%",
      left: posMap[x],
      transform: "translateX(-50%)",
      fontSize: crit ? "4rem" : "2.5rem",
      fontWeight: 900,
      color: crit ? "#ff4040" : "#ffd700",
      textShadow: crit
        ? "0 0 20px #ff0000, 0 0 40px #ff000088, 0 0 60px #ff000044"
        : "0 0 12px #ffd700, 0 0 24px #ffd70066",
      animation: "floatUp 1.4s ease-out forwards",
      zIndex: 30,
      pointerEvents: "none",
      whiteSpace: "nowrap",
      lineHeight: 1,
      fontFamily: "serif",
    }}>
      {crit && <div style={{ fontSize: "1rem", color: "#ff6060", letterSpacing: "0.2em", marginBottom: 4 }}>CHÍ MẠNG!</div>}
      -{value}
    </div>
  );
}

/* ── Full-width HP bar ────────────────────────────────── */
function HudBar({ current, max, color, glow, label, level }: {
  current: number; max: number; color: string; glow: string; label: string; level: number;
}) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (current / max) * 100 : 0));
  const low = pct < 25;
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs font-black font-mono whitespace-nowrap" style={{ color, minWidth: 100, textShadow: `0 0 8px ${glow}` }}>
        {label} <span className="opacity-50">Lv.{level}</span>
      </div>
      <div className="flex-1 relative h-6 rounded-sm overflow-hidden" style={{
        background: "rgba(0,0,0,0.7)",
        border: `1px solid ${color}33`,
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 10px ${glow}`,
          transition: "width 0.8s ease",
          borderRadius: "2px",
          animation: low ? "pulse 1s ease-in-out infinite" : undefined,
        }} />
        {/* Tick marks */}
        {[25, 50, 75].map(t => (
          <div key={t} style={{ position: "absolute", top: 0, left: `${t}%`, width: 1, height: "100%", background: "rgba(255,255,255,0.08)" }} />
        ))}
        <span className="absolute inset-0 flex items-center px-2 text-xs font-black text-white/80 select-none" style={{ fontSize: 11 }}>
          {current} / {max}
        </span>
      </div>
    </div>
  );
}

/* ── Action button ───────────────────────────────────── */
const ACTIONS = [
  { key: "attack"  as const, label: "TẤN CÔNG",   emoji: "⚔️",  sub: "Đòn thường",     col: "#dc2626", glow: "#dc262688" },
  { key: "skill"   as const, label: "KỸ NĂNG",    emoji: "⚡",  sub: "×1.8 Sát thương",col: "#3b82f6", glow: "#3b82f688" },
  { key: "defend"  as const, label: "PHÒNG THỦ",  emoji: "🛡️",  sub: "Giảm 50% DMG",  col: "#22c55e", glow: "#22c55e88" },
  { key: "flee"    as const, label: "TẨU THOÁT",  emoji: "💨",  sub: "50% thành công", col: "#71717a", glow: "#71717a66" },
];

export default function Battle({ id }: { id: number }) {
  const { data: battle, isLoading } = useGetBattle(id, { query: { enabled: !!id } });
  const { data: character } = useGetCharacter(battle?.characterId ?? 0, { query: { enabled: !!battle?.characterId } });
  const { data: npc } = useGetNpc(battle?.npcId ?? 0, { query: { enabled: !!battle?.npcId } });
  const { data: world } = useGetWorld(npc?.worldId ?? 0, { query: { enabled: !!npc?.worldId } });

  const battleAction = useBattleAction();
  const qc = useQueryClient();
  const logRef = useRef<HTMLDivElement>(null);

  const [charAnim,   setCharAnim]   = useState<"attack" | "hit" | "idle" | null>("idle");
  const [npcAnim,    setNpcAnim]    = useState<"attack" | "hit" | "idle" | null>("idle");
  const [dmg,        setDmg]        = useState<{ value: number; crit: boolean; side: "left"|"right" } | null>(null);
  const [screenFlash,setScreenFlash]= useState<"red"|"blue"|"gold"|null>(null);
  const [beam,       setBeam]       = useState<{ dir: "ltr"|"rtl"; col: string } | null>(null);
  const [prevLog,    setPrevLog]    = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!battle?.log || battle.log.length <= prevLog.length) return;
    const newLines = battle.log.slice(prevLog.length);
    setPrevLog(battle.log);
    for (const line of newLines) {
      const match  = line.match(/gây (\d+) sát thương/);
      const isCrit = /CHÍ MẠNG|chí mạng/i.test(line);
      if (match) {
        const val = parseInt(match[1]);
        const isPlayerHit = line.includes(npc?.name ?? "___") && line.includes("gây");
        if (isPlayerHit) {
          setNpcAnim("attack");
          setBeam({ dir: "rtl", col: "#ff4040" });
          setTimeout(() => { setCharAnim("hit"); setNpcAnim("idle"); setBeam(null); }, 350);
          setScreenFlash("red");
          setDmg({ value: val, crit: isCrit, side: "left" });
        } else {
          setCharAnim("attack");
          setBeam({ dir: "ltr", col: character ? (CLASS_COLOR[character.class] ?? "#f0c040") : "#f0c040" });
          setTimeout(() => { setNpcAnim("hit"); setCharAnim("idle"); setBeam(null); }, 350);
          setScreenFlash("gold");
          setDmg({ value: val, crit: isCrit, side: "right" });
        }
        setTimeout(() => { setDmg(null); setScreenFlash(null); setCharAnim("idle"); setNpcAnim("idle"); }, 1500);
      }
    }
  }, [battle?.log, npc?.name, character, prevLog.length]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battle?.log]);

  useEffect(() => {
    if (battle && battle.status !== "active") {
      setTimeout(() => setShowResult(true), 400);
    }
  }, [battle?.status]);

  if (isLoading || !battle || !character || !npc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "#050010" }}>
        <div style={{ fontSize: "5rem", animation: "idleBob 1.2s ease-in-out infinite" }}>⚔️</div>
        <div className="font-serif text-lg tracking-widest animate-pulse" style={{ color: "#f0c040" }}>ĐANG TẢI TRẬN CHIẾN…</div>
      </div>
    );
  }

  const theme  = world?.theme ?? "Nature";
  const bg     = THEME_BG[theme] ?? THEME_BG["Nature"];
  const fog    = THEME_FOG[theme] ?? "#ffffff11";
  const accent = THEME_ACCENT[theme] ?? "#f0c040";
  const isOver = battle.status !== "active";
  const won    = battle.status === "won";
  const lost   = battle.status === "lost";
  const isBoss = npc.isBoss;
  const charCol = CLASS_COLOR[character.class as CharClass] ?? "#f0c040";

  const doAction = async (action: typeof ACTIONS[0]["key"]) => {
    await battleAction.mutateAsync({ id, data: { action } });
    qc.invalidateQueries({ queryKey: getGetBattleQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(battle.characterId) });
  };

  return (
    <div
      className="relative -mx-4 -mt-8 overflow-hidden flex flex-col"
      style={{
        minHeight: "calc(100vh - 4rem)",
        background: bg,
      }}
    >
      {/* ── LAYERED BACKGROUND ──────────────────────── */}

      {/* Grid floor */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${fog} 1px, transparent 1px), linear-gradient(90deg, ${fog} 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        backgroundPosition: "center bottom",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
        zIndex: 0,
      }} />

      {/* Fog layer */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 30% 80%, ${fog} 0%, transparent 50%),
                     radial-gradient(ellipse at 70% 80%, ${fog} 0%, transparent 50%)`,
        animation: "fogDrift 8s ease-in-out infinite",
        zIndex: 1,
      }} />

      {/* Boss red vignette */}
      {isBoss && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(180,0,0,0.3) 100%)",
          animation: "pulse 2s ease-in-out infinite",
          zIndex: 2,
        }} />
      )}

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        zIndex: 2,
      }} />

      {/* Screen flash */}
      {screenFlash && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: screenFlash === "red"
            ? "radial-gradient(ellipse at center, rgba(255,0,0,0.25) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(255,220,0,0.2) 0%, transparent 70%)",
          animation: "hitFlash 0.5s ease-out forwards",
          zIndex: 35,
        }} />
      )}

      {/* ── TOP HUD ─────────────────────────────────── */}
      <div className="relative z-20 px-4 pt-3 pb-2 shrink-0" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)",
        borderBottom: `1px solid ${accent}22`,
      }}>
        <div className="flex items-center justify-between mb-2">
          <Link href={`/worlds/${npc.worldId}`}>
            <button className="flex items-center gap-1.5 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity" style={{ color: accent }}>
              <ArrowLeft className="w-3.5 h-3.5" /> {world?.name ?? "Thế Giới"}
            </button>
          </Link>
          <div className="flex items-center gap-2">
            {isBoss && (
              <span className="font-black text-[10px] tracking-widest px-2 py-0.5 rounded border animate-pulse"
                style={{ color: "#ff4040", borderColor: "#ff404055", background: "rgba(255,64,64,0.1)" }}>
                ☠ BOSS
              </span>
            )}
            <span className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded" style={{
              color: accent, background: `${accent}11`, border: `1px solid ${accent}33`
            }}>
              LƯỢT {battle.currentTurn}
            </span>
          </div>
        </div>

        {/* HP bars MMORPG style */}
        <div className="space-y-1.5">
          <HudBar
            current={battle.characterHp} max={character.maxHp}
            color={charCol} glow={charCol + "88"}
            label={character.name} level={character.level}
          />
          <HudBar
            current={battle.npcHp} max={npc.maxHp ?? npc.hp}
            color={isBoss ? "#ff2020" : "#ff6622"} glow={isBoss ? "#ff000099" : "#ff662266"}
            label={npc.name} level={npc.level}
          />
        </div>
      </div>

      {/* ── ARENA ───────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* Characters stage */}
        <div className="relative flex items-end justify-between px-4 pt-4" style={{ minHeight: 260 }}>

          {/* Beam attack effect */}
          {beam && <SkillBeam active direction={beam.dir} color={beam.col} />}

          {/* Damage number */}
          {dmg && <DmgNumber value={dmg.value} crit={dmg.crit} x={dmg.side === "left" ? "left" : "right"} />}

          {/* Player side */}
          <div className="flex flex-col items-center gap-1">
            <CharacterArt cls={character.class} anim={charAnim} dead={battle.characterHp <= 0} />
            <div className="text-center mt-1">
              <span className="font-serif font-black text-xs tracking-wider" style={{ color: charCol, textShadow: `0 0 8px ${charCol}88` }}>
                {character.class}
              </span>
            </div>
          </div>

          {/* Center VS */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-2 z-10">
            <Swords className="w-8 h-8" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }} />
            <span className="font-black text-sm tracking-widest" style={{ color: accent + "66" }}>VS</span>
          </div>

          {/* Enemy side */}
          <div className="flex flex-col items-center gap-1">
            {isBoss && (
              <div className="flex items-center gap-1 mb-1">
                <Crown className="w-4 h-4" style={{ color: "#ff4040" }} />
                <span className="font-black text-[10px] tracking-widest" style={{ color: "#ff4040", textShadow: "0 0 8px #ff000099" }}>
                  BOSS
                </span>
                <Crown className="w-4 h-4" style={{ color: "#ff4040" }} />
              </div>
            )}
            <NpcArt type={npc.type} isBoss={isBoss} anim={npcAnim} dead={battle.npcHp <= 0} />
            <div className="text-center mt-1">
              <span className="font-serif font-black text-xs tracking-wider" style={{
                color: isBoss ? "#ff4040" : "#ff8833",
                textShadow: `0 0 8px ${isBoss ? "#ff000088" : "#ff883366"}`,
              }}>
                {npc.type}
              </span>
            </div>
          </div>
        </div>

        {/* Ground line */}
        <div className="mx-8 h-px" style={{
          background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
          animation: "groundPulse 3s ease-in-out infinite",
        }} />

        {/* Reward info */}
        {!isOver && (
          <div className="flex justify-center gap-6 py-2 text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span><span style={{ color: "#f0c040aa" }}>{npc.xpReward}</span> XP</span>
            <span>·</span>
            <span><span style={{ color: "#fbbf24aa" }}>{npc.goldReward}</span> Gold</span>
          </div>
        )}

        {/* ── RESULT OVERLAY ─────────────────────── */}
        {isOver && showResult && (
          <div className="mx-4 my-2 rounded-2xl relative overflow-hidden" style={{
            background: won
              ? "linear-gradient(135deg, rgba(0,100,0,0.5), rgba(0,0,0,0.8))"
              : lost
              ? "linear-gradient(135deg, rgba(120,0,0,0.5), rgba(0,0,0,0.8))"
              : "rgba(0,0,0,0.6)",
            border: `2px solid ${won ? "#4ade80" : lost ? "#ff4040" : "#555"}55`,
            boxShadow: won ? "0 0 60px rgba(74,222,128,0.25), inset 0 0 60px rgba(74,222,128,0.05)"
                      : lost ? "0 0 60px rgba(255,0,0,0.25), inset 0 0 60px rgba(255,0,0,0.05)"
                      : undefined,
            animation: "rise 0.5s ease-out",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            {won && (
              <>
                <div style={{ fontSize: "4rem", animation: "rise 0.6s ease-out, idleBob 2s ease-in-out 0.6s infinite" }}>🏆</div>
                <p className="font-serif font-black text-3xl mt-2 uppercase tracking-widest" style={{ color: "#4ade80", textShadow: "0 0 30px rgba(74,222,128,0.7)" }}>CHIẾN THẮNG!</p>
                <div className="flex justify-center gap-8 mt-3 text-sm font-mono">
                  <span><span style={{ color: "#f0c040", fontWeight: 900 }}>+{battle.xpGained}</span> XP</span>
                  <span><span style={{ color: "#fbbf24", fontWeight: 900 }}>+{battle.goldGained}</span> Gold</span>
                </div>
              </>
            )}
            {lost && (
              <>
                <div style={{ fontSize: "4rem" }}>💀</div>
                <p className="font-serif font-black text-3xl mt-2 uppercase tracking-widest" style={{ color: "#ff4040", textShadow: "0 0 30px rgba(255,0,0,0.7)" }}>THẤT BẠI…</p>
                <p className="text-sm mt-2 opacity-40">Mất 10% gold · HP về 1 · Hãy thử lại!</p>
              </>
            )}
            {battle.status === "fled" && (
              <>
                <div style={{ fontSize: "3rem" }}>💨</div>
                <p className="font-serif text-xl mt-2" style={{ color: "#aaa" }}>Đã tháo chạy an toàn.</p>
              </>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <Link href={`/worlds/${npc.worldId}`}>
                <button className="px-5 py-2.5 rounded-xl font-serif font-black text-sm uppercase tracking-wider border-2 transition-all hover:opacity-80"
                  style={{ borderColor: accent, color: accent }}>
                  Tiếp Tục Khám Phá
                </button>
              </Link>
              {won && (
                <Link href={`/characters/${battle.characterId}`}>
                  <button className="px-5 py-2.5 rounded-xl font-serif font-black text-sm uppercase tracking-wider transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#f0c040,#c09030)", color: "#000" }}>
                    Xem Nhân Vật
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── SKILL BUTTONS ─────────────────────── */}
        {!isOver && (
          <div className="shrink-0 px-3 pb-3 pt-1" style={{
            background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)",
          }}>
            <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
              {ACTIONS.map(a => (
                <button
                  key={a.key}
                  onClick={() => doAction(a.key)}
                  disabled={battleAction.isPending}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    paddingTop: 14,
                    paddingBottom: 14,
                    paddingLeft: 8,
                    paddingRight: 8,
                    borderRadius: 12,
                    border: `2px solid ${battleAction.isPending ? "rgba(255,255,255,0.06)" : a.col + "88"}`,
                    background: battleAction.isPending ? "rgba(255,255,255,0.02)" : `linear-gradient(180deg, ${a.col}22 0%, ${a.col}08 100%)`,
                    boxShadow: battleAction.isPending ? "none" : `0 0 16px ${a.glow}, inset 0 1px 0 ${a.col}33`,
                    opacity: battleAction.isPending ? 0.25 : 1,
                    cursor: battleAction.isPending ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                  onMouseEnter={e => {
                    if (!battleAction.isPending) {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${a.glow}, inset 0 1px 0 ${a.col}55`;
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = battleAction.isPending ? "none" : `0 0 16px ${a.glow}, inset 0 1px 0 ${a.col}33`;
                  }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                >
                  <span style={{ fontSize: "2rem", lineHeight: 1, filter: `drop-shadow(0 0 8px ${a.col})` }}>{a.emoji}</span>
                  <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.1em", color: "#fff", fontFamily: "serif" }}>{a.label}</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{a.sub}</span>
                </button>
              ))}
            </div>
            {battleAction.isPending && (
              <p className="text-center font-mono text-xs mt-1.5 animate-pulse" style={{ color: accent }}>··· xử lý ···</p>
            )}
          </div>
        )}

        {/* ── BATTLE LOG ─────────────────────────── */}
        <div className="shrink-0 mx-3 mb-2 rounded-xl overflow-hidden" style={{
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${accent}18`,
          backdropFilter: "blur(8px)",
        }}>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: `${accent}18` }}>
            <Swords className="w-3 h-3" style={{ color: accent }} />
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-30">Nhật Ký Chiến Đấu</span>
          </div>
          <div ref={logRef} className="h-28 overflow-y-auto p-3 space-y-1" style={{ scrollbarWidth: "none" }}>
            {battle.log.map((line, i) => {
              const isLatest  = i >= battle.log.length - 2;
              const isCrit    = /CHÍ MẠNG|chí mạng/i.test(line);
              const isLevel   = /LEVEL UP/i.test(line);
              const isStart   = i === 0;
              const isVictory = /bị đánh bại|ngã xuống/i.test(line);
              let color = "rgba(255,255,255,0.25)";
              if (isStart)   color = accent;
              if (isLevel)   color = "#fbbf24";
              if (isCrit)    color = "#ff5050";
              if (isVictory) color = "#4ade80";
              if (isLatest && !isCrit && !isLevel && !isVictory && !isStart) color = "rgba(255,255,255,0.8)";
              return (
                <div key={i} className="flex gap-2 text-xs leading-relaxed">
                  <span className="font-mono text-[9px] opacity-20 shrink-0 mt-0.5">{String(i+1).padStart(2,"0")}</span>
                  <span style={{ color, fontWeight: isCrit || isLevel || isVictory ? 700 : 400,
                    textShadow: isCrit ? "0 0 8px #ff505088" : isLevel ? "0 0 8px #fbbf2488" : undefined }}>
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
