import { useListWorlds, useListCharacters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Lock, Crown, Sword, Users } from "lucide-react";
import { WorldScene } from "@/components/world-scene";
import { Skeleton } from "@/components/ui/skeleton";

const THEME_CFG: Record<string, {
  color: string; glow: string; emoji: string; label: string; gradient: string;
}> = {
  "Nature":        { color: "#4ade80", glow: "rgba(74,222,128,0.7)", emoji: "🌲", label: "THIÊN NHIÊN", gradient: "from-green-950 via-emerald-950 to-stone-950" },
  "Dark Fantasy":  { color: "#c084fc", glow: "rgba(192,132,252,0.7)", emoji: "🏰", label: "BÓNG TỐI",    gradient: "from-violet-950 via-slate-950 to-zinc-950" },
  "Dragon":        { color: "#fb923c", glow: "rgba(251,146,60,0.7)",  emoji: "🐉", label: "RỒNG LỬA",   gradient: "from-red-950 via-orange-950 to-stone-950" },
  "Steampunk":     { color: "#fbbf24", glow: "rgba(251,191,36,0.7)",  emoji: "⚙️", label: "CƠ GIỚI",    gradient: "from-amber-950 via-zinc-950 to-slate-950" },
  "Mythic":        { color: "#fde68a", glow: "rgba(253,230,138,0.7)", emoji: "✨", label: "THẦN THOẠI", gradient: "from-yellow-950 via-indigo-950 to-slate-950" },
};

export default function Worlds() {
  const { data: worlds = [], isLoading } = useListWorlds();
  const { data: characters = [] } = useListCharacters();

  const maxLevel = characters.length > 0 ? Math.max(...characters.map((c) => c.level)) : 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-6 md:px-10 py-5 border-b relative"
        style={{ borderColor: "rgba(180,130,0,0.15)", background: "rgba(5,2,12,0.9)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.3),transparent)" }} />
        <h1 className="text-2xl font-black uppercase tracking-[0.2em]" style={{ color: "#f0c040", textShadow: "0 0 20px rgba(240,180,0,0.6)", fontFamily: "serif" }}>
          🌍 THẾ GIỚI PHIÊU LƯU
        </h1>
        <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(180,140,60,0.45)" }}>
          Cấp cao nhất của bạn: <span style={{ color: "#f0c040", textShadow: "0 0 8px rgba(240,190,60,0.6)" }}>{maxLevel}</span> · Khám phá và chinh phục
        </p>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-none" style={{ background: "rgba(255,255,255,0.03)" }} />
          ))
        ) : (
          worlds.map((w) => {
            const locked = maxLevel < w.minLevel;
            const cfg = THEME_CFG[w.theme] ?? THEME_CFG["Nature"];

            return (
              <div key={w.id} className="relative overflow-hidden" style={{ height: "180px" }}>
                {/* Atmospheric background scene */}
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient}`} />
                  <WorldScene theme={w.theme} />
                </div>

                {/* Overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: locked
                      ? "rgba(0,0,0,0.82)"
                      : "linear-gradient(90deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.2) 100%)",
                    filter: locked ? "grayscale(0.9)" : "none",
                  }}
                />

                {/* Border */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: `1px solid ${locked ? "rgba(100,80,40,0.2)" : cfg.color + "30"}`,
                    borderTop: `2px solid ${locked ? "rgba(100,80,40,0.2)" : cfg.color + "60"}`,
                  }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="flex items-center gap-6 px-6 md:px-8 w-full">
                    {/* World emoji */}
                    <div
                      className="text-5xl md:text-6xl shrink-0"
                      style={{
                        filter: locked
                          ? "grayscale(1) opacity(0.3)"
                          : `drop-shadow(0 0 16px ${cfg.glow}) drop-shadow(0 0 40px ${cfg.glow}55)`,
                        animation: locked ? "none" : "idleBob 3s ease-in-out infinite",
                      }}
                    >
                      {cfg.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h2
                          className="font-black text-xl md:text-2xl uppercase tracking-wider"
                          style={{
                            color: locked ? "rgba(150,120,60,0.4)" : "#f0e8c0",
                            fontFamily: "serif",
                            textShadow: locked ? "none" : "0 0 15px rgba(240,220,160,0.3)",
                          }}
                        >
                          {w.name}
                        </h2>
                        {w.isBossWorld && !locked && (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                            style={{ background: "rgba(200,30,30,0.25)", border: "1px solid rgba(255,60,60,0.4)", color: "#ff6060" }}
                          >
                            <Crown className="w-2.5 h-2.5" /> BOSS
                          </span>
                        )}
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                          style={{
                            background: locked ? "rgba(80,60,20,0.2)" : `${cfg.color}15`,
                            border: `1px solid ${locked ? "rgba(120,90,30,0.2)" : cfg.color + "30"}`,
                            color: locked ? "rgba(120,100,50,0.4)" : cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <p
                        className="text-xs leading-relaxed mb-3 max-w-lg"
                        style={{ color: locked ? "rgba(120,100,50,0.35)" : "rgba(200,170,100,0.6)" }}
                      >
                        {w.description}
                      </p>

                      <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider flex-wrap">
                        <span className="flex items-center gap-1" style={{ color: locked ? "rgba(120,100,50,0.3)" : "rgba(200,160,80,0.6)" }}>
                          <Sword className="w-3 h-3" /> Yêu cầu cấp {w.minLevel}
                        </span>
                        <span className="flex items-center gap-1" style={{ color: locked ? "rgba(120,100,50,0.3)" : "rgba(200,160,80,0.6)" }}>
                          <Users className="w-3 h-3" /> {w.npcCount} NPC
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {locked ? (
                        <div className="flex flex-col items-center gap-2">
                          <Lock
                            className="w-8 h-8"
                            style={{ color: "rgba(150,120,50,0.35)", filter: "drop-shadow(0 0 6px rgba(150,100,0,0.2))" }}
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(150,120,50,0.35)" }}>
                            CẤP {w.minLevel}
                          </span>
                        </div>
                      ) : (
                        <Link href={`/worlds/${w.id}`}>
                          <button
                            className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-200"
                            style={{
                              background: `linear-gradient(135deg,${cfg.color}25 0%,${cfg.color}15 100%)`,
                              border: `1px solid ${cfg.color}50`,
                              color: cfg.color,
                              clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
                              textShadow: `0 0 10px ${cfg.glow}`,
                              boxShadow: `0 0 15px ${cfg.glow}20`,
                            }}
                          >
                            NHẬP MAP
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
