import { useListCharacters, useGetProgressionSummary, useListWorlds } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Globe, Trophy, Shield, Zap, Users, Star, ChevronRight } from "lucide-react";

const CLASS_PORTRAIT: Record<string, { emoji: string; color: string; glow: string; bg: string }> = {
  "Chiến Binh": { emoji: "⚔️", color: "#ff4040", glow: "rgba(255,40,40,0.7)", bg: "rgba(180,20,20,0.12)" },
  "Pháp Sư":    { emoji: "🔮", color: "#6060ff", glow: "rgba(80,80,255,0.7)", bg: "rgba(40,40,200,0.12)" },
  "Thích Khách":{ emoji: "🗡️", color: "#b060ff", glow: "rgba(160,60,255,0.7)", bg: "rgba(120,20,200,0.12)" },
  "Cung Thủ":   { emoji: "🏹", color: "#40c060", glow: "rgba(40,180,80,0.7)", bg: "rgba(20,140,50,0.12)" },
};

const WORLD_PORTRAIT: Record<string, { emoji: string; color: string; glow: string }> = {
  "Nature":        { emoji: "🌲", color: "#4ade80", glow: "rgba(74,222,128,0.6)" },
  "Dark Fantasy":  { emoji: "🏰", color: "#c084fc", glow: "rgba(192,132,252,0.6)" },
  "Dragon":        { emoji: "🐉", color: "#fb923c", glow: "rgba(251,146,60,0.6)" },
  "Steampunk":     { emoji: "⚙️", color: "#fbbf24", glow: "rgba(251,191,36,0.6)" },
  "Mythic":        { emoji: "✨", color: "#fde68a", glow: "rgba(253,230,138,0.6)" },
};

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.4))" }} />
      <div className="w-1.5 h-1.5 rotate-45 bg-yellow-500/60" />
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(200,150,0,0.4),transparent)" }} />
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.FC<any>; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 flex items-center justify-center rounded" style={{ background: "rgba(200,150,0,0.08)", border: "1px solid rgba(200,150,0,0.2)" }}>
        <Icon className="w-4 h-4" style={{ color: "#f0c040", filter: "drop-shadow(0 0 4px rgba(240,190,60,0.6))" }} />
      </div>
      <span
        className="text-xs font-black uppercase tracking-[0.25em]"
        style={{ color: "#d4a800", textShadow: "0 0 16px rgba(210,168,0,0.5)", fontFamily: "serif" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(200,150,0,0.3),transparent)" }} />
    </div>
  );
}

export default function Home() {
  const { data: characters = [] } = useListCharacters();
  const { data: summary } = useGetProgressionSummary();
  const { data: worlds = [] } = useListWorlds();

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: "clamp(320px, 45vh, 520px)", padding: "3rem 1rem 2.5rem" }}
      >
        {/* Animated background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[220, 320, 420, 520].map((r, i) => (
            <div
              key={r}
              className="absolute rounded-full"
              style={{
                width: r, height: r,
                border: `1px solid rgba(200,150,0,${0.06 - i * 0.012})`,
                boxShadow: `0 0 ${20 + i * 10}px rgba(200,140,0,${0.04 - i * 0.008}) inset`,
                animation: `spin ${30 + i * 15}s linear ${i % 2 === 0 ? "" : "reverse"} infinite`,
              }}
            />
          ))}
          {/* Center glow */}
          <div className="absolute w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle,rgba(200,120,0,0.12) 0%,transparent 70%)" }} />
        </div>

        {/* Main title */}
        <div className="relative z-10 space-y-4">
          <div
            className="text-6xl md:text-8xl font-black uppercase tracking-widest"
            style={{
              color: "#f0c040",
              textShadow: "0 0 30px rgba(240,180,0,0.9), 0 0 80px rgba(240,140,0,0.4), 0 0 150px rgba(240,120,0,0.15)",
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            RPG
          </div>
          <div
            className="text-3xl md:text-5xl font-black uppercase tracking-[0.5em]"
            style={{
              color: "rgba(240,200,80,0.85)",
              textShadow: "0 0 20px rgba(240,180,0,0.6), 0 0 50px rgba(240,130,0,0.25)",
              fontFamily: "serif",
            }}
          >
            WORLD
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] uppercase" style={{ color: "rgba(200,160,80,0.6)" }}>
            <Star className="w-3 h-3" />
            <span>Nhập Vai · Chiến Đấu · Trở Thành Huyền Thoại</span>
            <Star className="w-3 h-3" />
          </div>

          <GoldDivider />

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/characters/new">
              <button
                className="group flex items-center gap-2.5 px-8 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,rgba(200,30,30,0.9) 0%,rgba(140,10,10,0.95) 100%)",
                  border: "1px solid rgba(255,80,80,0.5)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(200,30,30,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                  clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  textShadow: "0 0 10px rgba(255,100,100,0.8)",
                }}
              >
                <Sword className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px rgba(255,150,150,0.8))" }} />
                TẠO NHÂN VẬT
              </button>
            </Link>
            <Link href="/worlds">
              <button
                className="flex items-center gap-2.5 px-8 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg,rgba(160,100,0,0.3) 0%,rgba(100,60,0,0.4) 100%)",
                  border: "1px solid rgba(200,150,0,0.4)",
                  color: "#f0c040",
                  boxShadow: "0 0 15px rgba(180,120,0,0.2), inset 0 1px 0 rgba(255,220,100,0.08)",
                  clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  textShadow: "0 0 10px rgba(240,190,60,0.7)",
                }}
              >
                <Globe className="w-4 h-4" />
                KHÁM PHÁ THẾ GIỚI
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Server Stats HUD ─────────────────────────────────── */}
      {summary && (
        <div
          className="mx-4 md:mx-8 rounded-none mb-6"
          style={{
            background: "linear-gradient(135deg,rgba(5,2,12,0.98) 0%,rgba(8,4,20,0.95) 100%)",
            border: "1px solid rgba(180,130,0,0.2)",
            borderTop: "2px solid rgba(200,150,0,0.4)",
          }}
        >
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "rgba(180,130,0,0.15)" }}>
            <Trophy className="w-3.5 h-3.5 text-yellow-500" style={{ filter: "drop-shadow(0 0 4px rgba(240,190,60,0.7))" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "rgba(200,160,60,0.7)" }}>THỐNG KÊ SERVER THỜI GIAN THỰC</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0" style={{ divideColor: "rgba(180,130,0,0.1)" }}>
            {[
              { label: "NHÂN VẬT", value: summary.totalCharacters, icon: Users, color: "#60a0ff" },
              { label: "TRẬN CHIẾN", value: summary.totalBattles, icon: Sword, color: "#ff6060" },
              { label: "NPC TIÊU DIỆT", value: summary.totalNpcsDefeated, icon: Shield, color: "#ff9940" },
              { label: "THẾ GIỚI", value: summary.worldsExplored, icon: Globe, color: "#40c080" },
              { label: "LỚP THỊNH HÀNH", value: summary.topClass, icon: Zap, color: "#d0a840" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center justify-center py-4 px-2 gap-1" style={{ borderColor: "rgba(180,130,0,0.1)" }}>
                  <Icon className="w-4 h-4 mb-1" style={{ color: s.color, filter: `drop-shadow(0 0 4px ${s.color}88)` }} />
                  <div className="text-xl font-black" style={{ color: s.color, textShadow: `0 0 12px ${s.color}88`, fontFamily: "serif" }}>{s.value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-center" style={{ color: "rgba(180,150,80,0.5)" }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 md:px-8 space-y-10 pb-10">
        {/* ── Characters ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between">
            <SectionTitle icon={Users} label="Nhân Vật Của Bạn" />
            <Link href="/characters">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all" style={{ color: "rgba(200,150,60,0.6)" }}>
                XEM TẤT CẢ <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {characters.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 rounded text-center"
              style={{ background: "rgba(5,2,12,0.6)", border: "1px dashed rgba(180,130,0,0.2)" }}
            >
              <div className="text-5xl mb-4" style={{ filter: "grayscale(1) opacity(0.3)" }}>⚔️</div>
              <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(200,160,80,0.5)" }}>Chưa có dũng sĩ nào</p>
              <p className="text-xs mb-5" style={{ color: "rgba(150,120,60,0.4)" }}>Tạo nhân vật đầu tiên để bắt đầu hành trình</p>
              <Link href="/characters/new">
                <button
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest"
                  style={{
                    background: "linear-gradient(135deg,rgba(180,20,20,0.9),rgba(120,8,8,0.95))",
                    border: "1px solid rgba(255,60,60,0.4)",
                    color: "#fff",
                    clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
                    textShadow: "0 0 8px rgba(255,100,100,0.8)",
                  }}
                >
                  TẠO NGAY
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {characters.slice(0, 6).map((c) => {
                const portrait = CLASS_PORTRAIT[c.class] ?? CLASS_PORTRAIT["Chiến Binh"];
                const hpPct = Math.min(100, Math.round((c.hp / c.maxHp) * 100));
                const xpPct = Math.min(100, Math.round((c.xp / c.xpToNext) * 100));
                return (
                  <Link key={c.id} href={`/characters/${c.id}`}>
                    <div
                      className="group relative cursor-pointer transition-all duration-200 overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg,rgba(5,2,12,0.97) 0%,${portrait.bg} 100%)`,
                        border: `1px solid ${portrait.color}22`,
                        boxShadow: `0 0 0 transparent`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px ${portrait.glow}33, 0 0 0 1px ${portrait.color}44`)}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 transparent")}
                    >
                      {/* Top color bar */}
                      <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${portrait.color},transparent)`, boxShadow: `0 0 8px ${portrait.glow}` }} />

                      <div className="p-4 flex gap-3">
                        {/* Portrait */}
                        <div
                          className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded text-3xl"
                          style={{ background: portrait.bg, border: `1px solid ${portrait.color}33`, boxShadow: `0 0 10px ${portrait.glow}22` }}
                        >
                          {portrait.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-sm truncate" style={{ color: "#f0e8c0", fontFamily: "serif" }}>{c.name}</span>
                            <span
                              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider"
                              style={{ background: `${portrait.color}18`, border: `1px solid ${portrait.color}40`, color: portrait.color }}
                            >
                              Cấp {c.level}
                            </span>
                          </div>
                          <div className="text-[10px] mb-2" style={{ color: portrait.color, opacity: 0.7 }}>{c.class}</div>

                          {/* HP bar */}
                          <div className="mb-1.5">
                            <div className="flex justify-between text-[9px] mb-0.5" style={{ color: "rgba(200,160,80,0.5)" }}>
                              <span>HP</span><span style={{ color: "#ff6060" }}>{c.hp}/{c.maxHp}</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-1.5 rounded-full transition-all" style={{ width: `${hpPct}%`, background: "linear-gradient(90deg,#c01010,#ff4040)", boxShadow: "0 0 6px rgba(255,40,40,0.5)" }} />
                            </div>
                          </div>
                          {/* XP bar */}
                          <div>
                            <div className="flex justify-between text-[9px] mb-0.5" style={{ color: "rgba(200,160,80,0.5)" }}>
                              <span>XP</span><span style={{ color: "#f0c040" }}>{xpPct}%</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <div className="h-1 rounded-full transition-all" style={{ width: `${xpPct}%`, background: "linear-gradient(90deg,#a06000,#f0c040)", boxShadow: "0 0 5px rgba(240,190,60,0.5)" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Worlds ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between">
            <SectionTitle icon={Globe} label="Thế Giới Phiêu Lưu" />
            <Link href="/worlds">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer" style={{ color: "rgba(200,150,60,0.6)" }}>
                XEM TẤT CẢ <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {worlds.slice(0, 3).map((w) => {
              const p = WORLD_PORTRAIT[w.theme] ?? WORLD_PORTRAIT["Nature"];
              return (
                <Link key={w.id} href={`/worlds/${w.id}`}>
                  <div
                    className="relative cursor-pointer overflow-hidden transition-all duration-200"
                    style={{
                      background: "rgba(5,2,12,0.97)",
                      border: `1px solid ${p.color}22`,
                      height: "120px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${p.color}55`)}
                    onMouseLeave={e => (e.currentTarget.style.border = `1px solid ${p.color}22`)}
                  >
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${p.color},transparent)` }} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-15">{p.emoji}</div>
                    <div className="relative p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <div className="font-black text-sm" style={{ color: "#f0e8c0", fontFamily: "serif" }}>{w.name}</div>
                          <div className="text-[9px] uppercase tracking-wider" style={{ color: p.color, opacity: 0.7 }}>Yêu cầu cấp {w.minLevel} · {w.npcCount} NPC</div>
                        </div>
                      </div>
                      {w.isBossWorld && (
                        <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider" style={{ background: "rgba(200,30,30,0.2)", border: "1px solid rgba(255,60,60,0.3)", color: "#ff6060" }}>
                          ★ BOSS WORLD
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
