import { useGetCharacter, useGetCharacterStats, useGetInventory, useEquipItem, useDeleteCharacter, getGetCharacterQueryKey, getGetInventoryQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Sword, Shield, Zap, Target, Trash2, ArrowLeft, Package, Star, Swords } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/* ── Class config ─────────────────────────────────────────── */
const CLASS_EMOJI: Record<string, string> = {
  "Chiến Binh": "⚔️", "Pháp Sư": "🔮", "Thích Khách": "🗡️", "Cung Thủ": "🏹",
};
const CLASS_COLOR: Record<string, string> = {
  "Chiến Binh": "#ff4040", "Pháp Sư": "#7070ff", "Thích Khách": "#c070ff", "Cung Thủ": "#40c060",
};
const CLASS_GRAD: Record<string, string> = {
  "Chiến Binh": "from-red-950 via-stone-950",
  "Pháp Sư":    "from-indigo-950 via-slate-950",
  "Thích Khách":"from-purple-950 via-zinc-950",
  "Cung Thủ":   "from-green-950 via-stone-950",
};

/* ── Rarity config ───────────────────────────────────────── */
const RARITY: Record<string, { border: string; color: string; glow: string; bg: string }> = {
  "Thường":     { border: "#52525b", color: "#a1a1aa", glow: "rgba(82,82,91,0.3)",    bg: "rgba(82,82,91,0.08)"   },
  "Hiếm":       { border: "#3b82f6", color: "#60a5fa", glow: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.1)"  },
  "Sử Thi":     { border: "#a855f7", color: "#c084fc", glow: "rgba(168,85,247,0.4)",  bg: "rgba(168,85,247,0.1)"  },
  "Huyền Thoại":{ border: "#eab308", color: "#fbbf24", glow: "rgba(234,179,8,0.5)",   bg: "rgba(234,179,8,0.12)"  },
};

/* ── Glowing bar ─────────────────────────────────────────── */
function GlowBar({ pct, color, glow }: { pct: number; color: string; glow: string }) {
  const low = pct < 25;
  return (
    <div className="w-full h-4 rounded-sm relative overflow-hidden"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className="h-full transition-all duration-700 rounded-sm"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          boxShadow: low ? `0 0 10px ${glow}, 0 0 20px ${glow}` : `0 0 6px ${glow}`,
          animation: low ? "pulse 1s ease-in-out infinite" : undefined,
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/80 select-none tracking-wider" />
    </div>
  );
}

/* ── Stat box ─────────────────────────────────────────────── */
function StatBox({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg relative overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${color}33`,
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color } as React.CSSProperties} />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
      </div>
      <div className="font-black text-xl" style={{ color, textShadow: `0 0 12px ${color}66` }}>{value}</div>
    </div>
  );
}

export default function CharacterDetail({ id }: { id: number }) {
  const { data: character, isLoading } = useGetCharacter(id, { query: { enabled: !!id } });
  const { data: stats } = useGetCharacterStats(id, { query: { enabled: !!id } });
  const { data: inventory = [] } = useGetInventory(id, { query: { enabled: !!id } });
  const equipItem      = useEquipItem();
  const deleteCharacter = useDeleteCharacter();
  const [, navigate]   = useLocation();
  const qc             = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-5xl" style={{ animation: "idleBob 1.5s ease-in-out infinite" }}>⚔️</div>
          <div className="font-serif text-lg tracking-widest animate-pulse" style={{ color: "#f0c040" }}>ĐANG TẢI NHÂN VẬT…</div>
        </div>
      </div>
    );
  }

  if (!character) return (
    <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.4)" }}>
      <p>Nhân vật không tồn tại.</p>
      <Link href="/characters">
        <button className="mt-4 px-5 py-2 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 transition-colors">Quay lại</button>
      </Link>
    </div>
  );

  const xpPct   = Math.min(100, Math.round((character.xp / character.xpToNext) * 100));
  const hpPct   = Math.min(100, Math.round((character.hp / character.maxHp) * 100));
  const color   = CLASS_COLOR[character.class] ?? "#f0c040";
  const grad    = CLASS_GRAD[character.class] ?? "from-zinc-950 via-stone-950";
  const emoji   = CLASS_EMOJI[character.class] ?? "⚔️";

  const handleEquip = async (itemId: number) => {
    await equipItem.mutateAsync({ id, data: { itemId } });
    qc.invalidateQueries({ queryKey: getGetCharacterQueryKey(id) });
    qc.invalidateQueries({ queryKey: getGetInventoryQueryKey(id) });
  };

  const handleDelete = async () => {
    if (!confirm(`Xoá nhân vật "${character.name}"? Hành động này không thể hoàn tác!`)) return;
    await deleteCharacter.mutateAsync({ id });
    navigate("/characters");
  };

  return (
    <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${grad} to-black overflow-hidden`}>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        zIndex: 1,
      }} />

      {/* Class color vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at top left, ${color}18 0%, transparent 60%)`,
        zIndex: 0,
      }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ── TOP BAR ───────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link href="/characters">
            <button className="flex items-center gap-2 text-sm font-serif opacity-50 hover:opacity-100 transition-opacity" style={{ color }}>
              <ArrowLeft className="w-4 h-4" />
              Nhân Vật
            </button>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteCharacter.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:opacity-100 opacity-60"
            style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", background: "rgba(239,68,68,0.05)" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xoá
          </button>
        </div>

        {/* ── CHARACTER PORTRAIT ────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4))",
            border: `2px solid ${color}44`,
            boxShadow: `0 0 40px ${color}22, inset 0 0 40px rgba(0,0,0,0.3)`,
          }}>

          {/* Corner decoration */}
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none" style={{
            borderTop: `2px solid ${color}66`, borderLeft: `2px solid ${color}66`,
          }} />
          <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{
            borderTop: `2px solid ${color}66`, borderRight: `2px solid ${color}66`,
          }} />
          <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none" style={{
            borderBottom: `2px solid ${color}66`, borderLeft: `2px solid ${color}66`,
          }} />
          <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none" style={{
            borderBottom: `2px solid ${color}66`, borderRight: `2px solid ${color}66`,
          }} />

          <div className="flex items-center gap-6 p-5">
            {/* Portrait emoji */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full" style={{
                background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                animation: "pulse 3s ease-in-out infinite",
                transform: "scale(1.5)",
              }} />
              <div style={{
                fontSize: "5rem",
                filter: `drop-shadow(0 0 20px ${color}88)`,
                animation: "idleBob 3s ease-in-out infinite",
                lineHeight: 1,
                position: "relative",
              }}>
                {emoji}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-2 rounded-full w-8 h-8 flex items-center justify-center font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  color: "#000",
                  boxShadow: `0 0 10px ${color}99`,
                  border: "2px solid rgba(0,0,0,0.5)",
                }}>
                {character.level}
              </div>
            </div>

            {/* Name & bars */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="font-serif font-black text-2xl uppercase tracking-widest leading-none" style={{
                  color,
                  textShadow: `0 0 20px ${color}66`,
                }}>
                  {character.name}
                </h1>
                <p className="text-xs font-mono mt-1 opacity-50">{character.class} · Cấp {character.level}</p>
              </div>

              {/* HP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-50 flex items-center gap-1"><Shield className="w-3 h-3" />HP</span>
                  <span style={{ color }}>{character.hp} / {character.maxHp}</span>
                </div>
                <GlowBar pct={hpPct} color={color} glow={`${color}88`} />
              </div>

              {/* XP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-50 flex items-center gap-1"><Zap className="w-3 h-3" />XP</span>
                  <span style={{ color: "#f0c040" }}>{character.xp} / {character.xpToNext}</span>
                </div>
                <GlowBar pct={xpPct} color="#f0c040" glow="rgba(240,192,64,0.6)" />
              </div>
            </div>

            {/* Gold */}
            <div className="shrink-0 text-center p-3 rounded-xl"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <div className="text-2xl mb-1">◆</div>
              <div className="font-black text-xl" style={{ color: "#fbbf24", textShadow: "0 0 12px rgba(251,191,36,0.5)" }}>
                {character.gold}
              </div>
              <div className="text-[10px] font-mono opacity-40">GOLD</div>
            </div>
          </div>
        </div>

        {/* ── COMBAT STATS ─────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Swords className="w-3.5 h-3.5" style={{ color }} />
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Chỉ Số Chiến Đấu</span>
          </div>
          <div className="p-4">
            {stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatBox icon={Sword}  label="Tấn Công"  value={stats.attack}         color="#ff6060" />
                <StatBox icon={Shield} label="Phòng Thủ" value={stats.defense}        color="#60a0ff" />
                <StatBox icon={Zap}    label="Tốc Độ"    value={stats.speed}          color="#40d060" />
                <StatBox icon={Target} label="Chí Mạng"  value={`${stats.critRate}%`} color="#d070ff" />
                <StatBox icon={Swords} label="Trận Đấu"  value={stats.totalBattles}   color="#aaaaaa" />
                <StatBox icon={Star}   label="Thắng/Thua" value={`${stats.wins}W/${stats.losses}L`} color="#f0c040" />
              </div>
            ) : (
              <div className="text-center py-4 font-mono text-xs animate-pulse opacity-40">Đang tải chỉ số…</div>
            )}
          </div>
        </div>

        {/* ── EQUIPMENT ────────────────────────────────────── */}
        {(character.equippedWeapon || character.equippedArmor) && (
          <div className="rounded-xl overflow-hidden"
            style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${color}22` }}>
            <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: `${color}22` }}>
              <Shield className="w-3.5 h-3.5" style={{ color }} />
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Trang Bị Hiện Tại</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {character.equippedWeapon && (
                <div className="p-3 rounded-lg" style={{ background: "rgba(255,64,64,0.08)", border: "1px solid rgba(255,64,64,0.3)" }}>
                  <div className="text-xs font-mono opacity-40 mb-1">VŨ KHÍ</div>
                  <div className="text-sm font-bold text-white/80">{character.equippedWeapon}</div>
                </div>
              )}
              {character.equippedArmor && (
                <div className="p-3 rounded-lg" style={{ background: "rgba(64,128,255,0.08)", border: "1px solid rgba(64,128,255,0.3)" }}>
                  <div className="text-xs font-mono opacity-40 mb-1">GIÁP</div>
                  <div className="text-sm font-bold text-white/80">{character.equippedArmor}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACTION BUTTON ─────────────────────────────────── */}
        <Link href="/worlds">
          <button
            className="w-full py-4 rounded-xl font-serif font-black text-base uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${color}cc, ${color}88)`,
              color: "#000",
              boxShadow: `0 0 20px ${color}55`,
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <Sword className="w-5 h-5" />
            Xuất Trận
            <Sword className="w-5 h-5 scale-x-[-1]" />
          </button>
        </Link>

        {/* ── INVENTORY ─────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Package className="w-3.5 h-3.5 opacity-40" />
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Kho Đồ</span>
            <span className="ml-auto font-mono text-[10px] opacity-30">{inventory.length} vật phẩm</span>
          </div>

          <div className="p-4">
            {inventory.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-15" />
                <p className="text-sm font-mono opacity-30">Kho đồ trống. Chiến đấu để nhận trang bị!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inventory.map(item => {
                  const r = RARITY[item.rarity] ?? RARITY["Thường"];
                  return (
                    <div key={item.id}
                      className="rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:opacity-95"
                      style={{
                        background: item.isEquipped ? r.bg : "rgba(0,0,0,0.3)",
                        border: `1px solid ${r.border}${item.isEquipped ? "99" : "44"}`,
                        boxShadow: item.isEquipped ? `0 0 12px ${r.glow}` : undefined,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-white/90 truncate">{item.name}</div>
                        <div className="text-[10px] font-mono mt-0.5 flex items-center gap-2">
                          <span style={{ color: r.color }}>{item.rarity}</span>
                          <span className="opacity-30">·</span>
                          <span className="opacity-40">{item.type === "weapon" ? "Vũ khí" : "Giáp"}</span>
                          {item.attackBonus  > 0 && <span className="text-red-400">+{item.attackBonus} ATK</span>}
                          {item.defenseBonus > 0 && <span className="text-blue-400">+{item.defenseBonus} DEF</span>}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {item.isEquipped ? (
                          <span className="text-[10px] font-black px-2 py-1 rounded font-mono uppercase tracking-wider"
                            style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}66` }}>
                            ✓ Đang Đeo
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEquip(item.id)}
                            disabled={equipItem.isPending}
                            className="text-[10px] font-black px-2.5 py-1.5 rounded transition-all hover:opacity-90 active:scale-95 font-mono uppercase tracking-wider"
                            style={{
                              background: "rgba(240,192,64,0.12)",
                              color: "#f0c040",
                              border: "1px solid rgba(240,192,64,0.4)",
                            }}
                          >
                            Trang Bị
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </div>
  );
}
