import { useListCharacters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Shield, Zap, Sword } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CLASS_CFG: Record<string, { emoji: string; color: string; glow: string; bg: string; label: string }> = {
  "Chiến Binh": { emoji: "⚔️", color: "#ff5050", glow: "rgba(255,60,60,0.7)", bg: "rgba(180,20,20,0.1)", label: "WARRIOR" },
  "Pháp Sư":    { emoji: "🔮", color: "#7070ff", glow: "rgba(80,80,255,0.7)", bg: "rgba(40,40,200,0.1)", label: "MAGE" },
  "Thích Khách":{ emoji: "🗡️", color: "#c070ff", glow: "rgba(160,60,255,0.7)", bg: "rgba(120,20,200,0.1)", label: "ASSASSIN" },
  "Cung Thủ":   { emoji: "🏹", color: "#40d070", glow: "rgba(40,180,80,0.7)", bg: "rgba(20,140,50,0.1)", label: "ARCHER" },
};

export default function Characters() {
  const { data: characters = [], isLoading } = useListCharacters();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="relative px-6 md:px-10 py-6 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(180,130,0,0.15)", background: "rgba(5,2,12,0.8)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.3),transparent)" }} />
        <div>
          <h1
            className="text-2xl font-black uppercase tracking-[0.2em]"
            style={{ color: "#f0c040", textShadow: "0 0 20px rgba(240,180,0,0.6)", fontFamily: "serif" }}
          >
            ⚔ NHÂN VẬT
          </h1>
          <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(180,140,60,0.5)" }}>
            Chọn hoặc tạo nhân vật để bắt đầu cuộc phiêu lưu
          </p>
        </div>
        <Link href="/characters/new">
          <button
            className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all"
            style={{
              background: "linear-gradient(135deg,rgba(180,20,20,0.9),rgba(120,8,8,0.95))",
              border: "1px solid rgba(255,60,60,0.4)",
              color: "#fff",
              clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)",
              textShadow: "0 0 8px rgba(255,100,100,0.8)",
              boxShadow: "0 0 15px rgba(180,20,20,0.3)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            TẠO NHÂN VẬT
          </button>
        </Link>
      </div>

      <div className="flex-1 p-6 md:p-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-none" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center mx-auto max-w-sm"
            style={{ border: "1px dashed rgba(200,150,0,0.15)" }}
          >
            <div className="text-6xl mb-4 opacity-20">⚔️</div>
            <div className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: "rgba(200,160,80,0.45)" }}>CHƯA CÓ DŨNG SĨ</div>
            <div className="text-xs mb-8" style={{ color: "rgba(150,120,60,0.4)" }}>Hành trình của bạn bắt đầu từ đây</div>
            <Link href="/characters/new">
              <button
                className="flex items-center gap-2 px-7 py-3 text-xs font-black uppercase tracking-widest"
                style={{
                  background: "linear-gradient(135deg,rgba(180,20,20,0.9),rgba(120,8,8,0.95))",
                  border: "1px solid rgba(255,60,60,0.4)",
                  color: "#fff",
                  clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                  textShadow: "0 0 8px rgba(255,100,100,0.8)",
                }}
              >
                <Plus className="w-4 h-4" /> TẠO NHÂN VẬT ĐẦU TIÊN
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c) => {
              const cfg = CLASS_CFG[c.class] ?? CLASS_CFG["Chiến Binh"];
              const hpPct = Math.min(100, (c.hp / c.maxHp) * 100);
              const xpPct = Math.min(100, (c.xp / c.xpToNext) * 100);

              return (
                <Link key={c.id} href={`/characters/${c.id}`}>
                  <div
                    className="group relative cursor-pointer overflow-hidden transition-all duration-200"
                    style={{
                      background: `linear-gradient(160deg,rgba(5,2,12,0.98) 0%,${cfg.bg} 100%)`,
                      border: `1px solid ${cfg.color}25`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.border = `1px solid ${cfg.color}55`;
                      e.currentTarget.style.boxShadow = `0 0 25px ${cfg.glow}22, 0 4px 20px rgba(0,0,0,0.6)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.border = `1px solid ${cfg.color}25`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Top class color bar */}
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`, boxShadow: `0 0 8px ${cfg.glow}` }} />

                    {/* Portrait section */}
                    <div className="relative flex items-center gap-0 p-5 pb-3">
                      {/* Background emoji watermark */}
                      <div className="absolute right-3 top-2 text-6xl opacity-[0.06] select-none pointer-events-none">{cfg.emoji}</div>

                      {/* Portrait frame */}
                      <div
                        className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center text-4xl rounded"
                        style={{
                          background: `radial-gradient(circle, ${cfg.bg} 0%, rgba(0,0,0,0.4) 100%)`,
                          border: `1px solid ${cfg.color}35`,
                          boxShadow: `0 0 15px ${cfg.glow}18 inset, 0 0 20px ${cfg.glow}10`,
                        }}
                      >
                        {cfg.emoji}
                        {/* Level badge */}
                        <div
                          className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-full"
                          style={{ background: "rgba(0,0,0,0.9)", border: `1px solid ${cfg.color}55`, color: cfg.color }}
                        >
                          {c.level}
                        </div>
                      </div>

                      {/* Name + class */}
                      <div className="ml-4 min-w-0">
                        <div className="font-black text-base truncate" style={{ color: "#f0e8c0", fontFamily: "serif", textShadow: "0 0 10px rgba(240,220,160,0.3)" }}>
                          {c.name}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}>
                          {cfg.label}
                        </div>
                        <div className="text-[9px] mt-1" style={{ color: "rgba(200,160,80,0.45)" }}>
                          💰 {c.gold} vàng
                        </div>
                      </div>
                    </div>

                    {/* Stat bars */}
                    <div className="px-5 pb-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-[9px] mb-1 font-bold uppercase" style={{ color: "rgba(200,140,60,0.5)" }}>
                          <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" style={{ color: "#ff6060" }} /> HP</span>
                          <span style={{ color: "#ff6060" }}>{c.hp}/{c.maxHp}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${hpPct}%`, background: `linear-gradient(90deg,#9a0000,#ff4040)`, boxShadow: "0 0 8px rgba(255,40,40,0.6)" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] mb-1 font-bold uppercase" style={{ color: "rgba(200,140,60,0.5)" }}>
                          <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" style={{ color: "#f0c040" }} /> EXP</span>
                          <span style={{ color: "#f0c040" }}>{Math.round(xpPct)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${xpPct}%`, background: "linear-gradient(90deg,#7a5000,#f0c040)", boxShadow: "0 0 6px rgba(240,190,60,0.6)" }}
                          />
                        </div>
                      </div>

                      {/* Equipped items */}
                      {(c.equippedWeapon || c.equippedArmor) && (
                        <div className="pt-2 border-t flex gap-3 text-[9px]" style={{ borderColor: `${cfg.color}18`, color: "rgba(180,150,80,0.5)" }}>
                          {c.equippedWeapon && <span>⚔ {c.equippedWeapon}</span>}
                          {c.equippedArmor && <span>🛡 {c.equippedArmor}</span>}
                        </div>
                      )}
                    </div>

                    {/* Bottom enter indicator */}
                    <div
                      className="px-5 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 border-t transition-all group-hover:opacity-100 opacity-0"
                      style={{ borderColor: `${cfg.color}20`, color: cfg.color, background: `${cfg.color}08` }}
                    >
                      <Sword className="w-2.5 h-2.5" /> XEM NHÂN VẬT
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
