import { useGetLeaderboard, useGetProgressionSummary } from "@workspace/api-client-react";
import { Trophy, Sword, Shield, Users, Zap, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const CLASS_CFG: Record<string, { emoji: string; color: string }> = {
  "Chiến Binh": { emoji: "⚔️", color: "#ff5050" },
  "Pháp Sư":    { emoji: "🔮", color: "#7070ff" },
  "Thích Khách":{ emoji: "🗡️", color: "#c070ff" },
  "Cung Thủ":   { emoji: "🏹", color: "#40c060" },
};

const RANK_CFG: Record<number, { color: string; glow: string; bg: string; label: string; icon: string }> = {
  1: { color: "#f0c040", glow: "rgba(240,190,60,0.8)", bg: "rgba(200,150,0,0.12)", label: "HUYỀN THOẠI", icon: "👑" },
  2: { color: "#d0d0e8", glow: "rgba(200,200,220,0.6)", bg: "rgba(160,160,200,0.06)", label: "BẠC",        icon: "🥈" },
  3: { color: "#d08040", glow: "rgba(200,120,60,0.6)",  bg: "rgba(180,100,40,0.08)", label: "ĐỒNG",       icon: "🥉" },
};

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useGetLeaderboard();
  const { data: summary } = useGetProgressionSummary();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-6 md:px-10 py-5 border-b relative"
        style={{ borderColor: "rgba(180,130,0,0.15)", background: "rgba(5,2,12,0.9)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.3),transparent)" }} />
        <h1 className="text-2xl font-black uppercase tracking-[0.2em]" style={{ color: "#f0c040", textShadow: "0 0 20px rgba(240,180,0,0.6)", fontFamily: "serif" }}>
          👑 BẢNG XẾP HẠNG
        </h1>
        <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(180,140,60,0.45)" }}>Những chiến binh hùng mạnh nhất thế giới</p>
      </div>

      {/* Server Stats */}
      {summary && (
        <div
          className="mx-4 md:mx-6 mt-4 grid grid-cols-2 sm:grid-cols-4"
          style={{ border: "1px solid rgba(180,130,0,0.15)", borderTop: "2px solid rgba(200,150,0,0.3)" }}
        >
          {[
            { label: "NHÂN VẬT", value: summary.totalCharacters, icon: Users, color: "#60a0ff" },
            { label: "TRẬN CHIẾN", value: summary.totalBattles, icon: Sword, color: "#ff6060" },
            { label: "NPC BẠI", value: summary.totalNpcsDefeated, icon: Shield, color: "#ff9940" },
            { label: "LỚP ĐẦU", value: summary.topClass, icon: Zap, color: "#f0c040" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center py-4 gap-1"
                style={{ borderRight: i < 3 ? "1px solid rgba(180,130,0,0.1)" : "none", background: "rgba(5,2,12,0.6)" }}
              >
                <Icon className="w-4 h-4 mb-0.5" style={{ color: s.color, filter: `drop-shadow(0 0 4px ${s.color}88)` }} />
                <div className="text-lg font-black" style={{ color: s.color, textShadow: `0 0 12px ${s.color}88`, fontFamily: "serif" }}>{s.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(180,140,60,0.4)" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rankings */}
      <div className="flex-1 p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-none" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            style={{ border: "1px dashed rgba(200,150,0,0.15)" }}
          >
            <div className="text-5xl mb-4 opacity-20">👑</div>
            <div className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: "rgba(200,160,80,0.4)" }}>CHƯA CÓ BẢNG XẾP HẠNG</div>
            <div className="text-xs mb-6" style={{ color: "rgba(150,120,60,0.35)" }}>Tạo nhân vật và chiến đấu để lên bảng xếp hạng</div>
            <Link href="/characters/new">
              <button
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest"
                style={{
                  background: "linear-gradient(135deg,rgba(180,20,20,0.9),rgba(120,8,8,0.95))",
                  border: "1px solid rgba(255,60,60,0.4)",
                  color: "#fff",
                  clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
                }}
              >
                TẠO NHÂN VẬT
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Table header */}
            <div
              className="grid gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest"
              style={{ gridTemplateColumns: "44px 1fr 60px 60px 60px", color: "rgba(180,140,60,0.4)", borderBottom: "1px solid rgba(180,130,0,0.15)" }}
            >
              <div>#</div>
              <div>NHÂN VẬT</div>
              <div className="text-center">CẤP</div>
              <div className="text-center">TRẬN</div>
              <div className="text-center">THẮNG</div>
            </div>

            {leaderboard.map((entry) => {
              const rankCfg = RANK_CFG[entry.rank];
              const classCfg = CLASS_CFG[entry.class] ?? { emoji: "⚔️", color: "#f0c040" };

              return (
                <Link key={entry.characterId} href={`/characters/${entry.characterId}`}>
                  <div
                    className="grid gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center relative overflow-hidden"
                    style={{
                      gridTemplateColumns: "44px 1fr 60px 60px 60px",
                      background: rankCfg ? rankCfg.bg : "rgba(5,2,12,0.6)",
                      border: `1px solid ${rankCfg ? rankCfg.color + "20" : "rgba(180,130,0,0.08)"}`,
                      borderLeft: `3px solid ${rankCfg ? rankCfg.color + "60" : "rgba(180,130,0,0.15)"}`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = rankCfg ? rankCfg.bg.replace("0.12", "0.2").replace("0.06", "0.12").replace("0.08", "0.14") : "rgba(20,14,5,0.8)")}
                    onMouseLeave={e => (e.currentTarget.style.background = rankCfg ? rankCfg.bg : "rgba(5,2,12,0.6)")}
                  >
                    {/* Top border for top 3 */}
                    {rankCfg && entry.rank === 1 && (
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg,transparent,${rankCfg.color}60,transparent)` }} />
                    )}

                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      {rankCfg ? (
                        <div className="text-xl" style={{ filter: `drop-shadow(0 0 8px ${rankCfg.glow})` }}>
                          {rankCfg.icon}
                        </div>
                      ) : (
                        <span className="text-sm font-black font-mono" style={{ color: "rgba(180,140,60,0.4)" }}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Character info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-base rounded"
                        style={{
                          background: `${classCfg.color}12`,
                          border: `1px solid ${classCfg.color}30`,
                          boxShadow: `0 0 8px ${classCfg.color}10`,
                        }}
                      >
                        {classCfg.emoji}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-black text-sm truncate"
                          style={{
                            color: rankCfg ? rankCfg.color : "#f0e8c0",
                            fontFamily: "serif",
                            textShadow: rankCfg ? `0 0 12px ${rankCfg.glow}` : "none",
                          }}
                        >
                          {entry.name}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: classCfg.color, opacity: 0.7 }}>
                          {entry.class}
                        </div>
                      </div>
                      {entry.rank === 1 && (
                        <div className="flex items-center gap-0.5 ml-1">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5" style={{ color: "#f0c040", filter: "drop-shadow(0 0 4px rgba(240,190,60,0.8))" }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Level */}
                    <div className="text-center">
                      <span
                        className="text-sm font-black"
                        style={{
                          color: rankCfg ? rankCfg.color : "#f0c040",
                          textShadow: rankCfg ? `0 0 10px ${rankCfg.glow}` : "0 0 8px rgba(240,190,60,0.5)",
                          fontFamily: "serif",
                        }}
                      >
                        {entry.level}
                      </span>
                    </div>

                    {/* Battles */}
                    <div className="text-center text-sm font-bold" style={{ color: "rgba(180,140,60,0.5)" }}>
                      {entry.totalBattles}
                    </div>

                    {/* Wins */}
                    <div className="text-center">
                      <span className="text-sm font-black" style={{ color: "#40c060", textShadow: "0 0 8px rgba(40,180,80,0.5)" }}>
                        {entry.wins}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
