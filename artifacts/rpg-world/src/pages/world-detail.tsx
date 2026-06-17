import {
  useGetWorld, useListWorldNpcs, useListCharacters,
  useStartBattle, getListBattlesQueryKey,
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, Sword, Crown, Shield, Star,
  ChevronRight, MapPin, Skull, Footprints, Users, Swords, Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WorldScene } from "@/components/world-scene";

/* ── Per-world config ──────────────────────────────────────── */
const THEMES: Record<string, {
  grad: string; accent: string; border: string;
  ambience: string[]; encounterLines: string[];
}> = {
  Nature: {
    grad:   "from-green-950 via-emerald-950 to-stone-950",
    accent: "text-green-400", border: "border-green-700/50",
    ambience: [
      "Gió thổi xào xạc qua những tán cây cổ thụ ngàn năm…",
      "Tiếng hú của loài thú hoang vọng lại từ xa sâu trong rừng…",
      "Sương mù bao phủ mặt đất, những bóng sinh vật ẩn hiện trong bóng tối…",
      "Không khí ẩm ướt, mùi lá mục và hoa rừng quyện vào nhau…",
    ],
    encounterLines: [
      "Một bóng đen lao ra từ bụi cây!",
      "Mặt đất rung chuyển — thứ gì đó đang tiến lại!",
      "Tiếng gầm gừ vang lên từ bóng tối phía trước!",
      "Cành cây gãy — kẻ địch đã phát hiện ra bạn!",
    ],
  },
  "Dark Fantasy": {
    grad:   "from-violet-950 via-slate-950 to-zinc-950",
    accent: "text-purple-400", border: "border-purple-700/50",
    ambience: [
      "Lâu đài ảm đạm hiện ra giữa màn đêm tối tăm…",
      "Tiếng khóc than của những linh hồn lạc lối vang vọng trong không khí…",
      "Ánh đèn ma trơi lập lờ dọc theo hành lang bỏ hoang…",
      "Mùi xương khô và bụi thời gian choáng ngợp kẻ xâm nhập…",
    ],
    encounterLines: [
      "Một bộ xương bước ra từ bóng tối!",
      "Cánh cửa bật mở — thứ gì đó đang rình rập bạn!",
      "Tiếng chuỗi xiềng xích leng keng — undead đang đến gần!",
      "Mắt đỏ rực trong bóng tối nhìn chằm chằm vào bạn!",
    ],
  },
  Dragon: {
    grad:   "from-red-950 via-orange-950 to-stone-950",
    accent: "text-orange-400", border: "border-red-700/50",
    ambience: [
      "Nhiệt độ tăng vọt khi bạn đi sâu vào hang động…",
      "Ánh lửa rồng phản chiếu trên những bức tường đá cuội…",
      "Hơi nước nóng bỏng phun ra từ các kẽ nứt trên mặt đất…",
      "Tiếng gầm của rồng cổ đại rung chuyển từng viên đá dưới chân bạn…",
    ],
    encounterLines: [
      "Rồng trẻ lao xuống từ vách đá phía trên!",
      "Mặt đất nứt toác — sinh vật lửa trỗi dậy!",
      "Lửa thở phụt ra từ bóng tối — rồng đã thấy bạn!",
      "Cánh rồng đập mạnh — chiến binh rồng chặn đường bạn!",
    ],
  },
  Steampunk: {
    grad:   "from-amber-950 via-zinc-950 to-slate-950",
    accent: "text-amber-400", border: "border-amber-700/50",
    ambience: [
      "Bánh răng khổng lồ quay không ngừng trong thành phố sắt thép…",
      "Hơi nước xì ra từ những ống dẫn chằng chịt trên trần…",
      "Tiếng bước chân cơ khí vang lên trên sàn kim loại…",
      "Ánh đèn hơi vàng vọt soi rõ từng cỗ máy chiến tranh khổng lồ…",
    ],
    encounterLines: [
      "Robot tuần tra phát hiện ra bạn — kích hoạt chế độ chiến đấu!",
      "Còi báo động hú lên — lính cơ giới đang đổ đến!",
      "Cỗ máy chiến tranh khởi động — mục tiêu đã được khóa!",
      "Thợ máy điên bật khỏi góc khuất với cờ lê trên tay!",
    ],
  },
  Mythic: {
    grad:   "from-yellow-950 via-indigo-950 to-slate-950",
    accent: "text-yellow-400", border: "border-yellow-600/50",
    ambience: [
      "Ánh hào quang thần thánh tràn ngập cõi linh giới…",
      "Không gian méo dạng — quy luật vật lý không còn ý nghĩa ở đây…",
      "Tiếng cung đàn thiên đường vang lên, nhưng chứa đầy hiểm nguy…",
      "Các vì tinh tú sắp xếp thành hình chiến trận báo hiệu đại chiến…",
    ],
    encounterLines: [
      "Thiên sứ sa ngã giương cánh đen — thách thức bạn!",
      "Ác thần hiện hình từ hư không — sức mạnh hủy diệt tràn ra!",
      "Cõi trời rung chuyển — thần linh nhập cuộc!",
      "Bóng tối và ánh sáng xung đột — bạn đã bị bao vây!",
    ],
  },
};

const DIFF: Record<string, string> = {
  Easy:   "bg-green-900/40 text-green-300 border-green-700/50",
  Normal: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  Hard:   "bg-orange-900/40 text-orange-300 border-orange-700/50",
  Boss:   "bg-red-900/40 text-red-300 border-red-700/50",
};

/* ── Character silhouette SVGs per class ─────────────────── */
const CLASS_ICONS: Record<string, string> = {
  "Chiến Binh":  "⚔️",
  "Pháp Sư":     "🔮",
  "Thích Khách": "🗡️",
  "Cung Thủ":    "🏹",
};

type Phase = "gate" | "explore" | "encounter";

export default function WorldDetail({ id }: { id: number }) {
  const { data: world, isLoading } = useGetWorld(id, { query: { enabled: !!id } });
  const { data: npcs = [] } = useListWorldNpcs(id, { query: { enabled: !!id } });
  const { data: characters = [] } = useListCharacters();
  const startBattle = useStartBattle();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [phase, setPhase] = useState<Phase>("gate");
  const [selectedChar, setSelectedChar] = useState<number | null>(null);
  const [encounterNpc, setEncounterNpc] = useState<(typeof npcs)[0] | null>(null);
  const [ambienceIdx, setAmbienceIdx] = useState(0);
  const [entering, setEntering] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);

  const t = THEMES[world?.theme ?? ""] ?? THEMES["Nature"];

  useEffect(() => {
    if (characters.length > 0 && selectedChar === null) setSelectedChar(characters[0].id);
  }, [characters, selectedChar]);

  useEffect(() => {
    if (phase !== "explore") { setShowCharacter(false); return; }
    const timer = setTimeout(() => setShowCharacter(true), 300);
    const cycle = setInterval(() => setAmbienceIdx(i => (i + 1) % t.ambience.length), 4500);
    return () => { clearTimeout(timer); clearInterval(cycle); };
  }, [phase, t.ambience.length]);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => { setPhase("explore"); setEntering(false); }, 900);
  };

  const handleExplore = () => {
    const pool = npcs.filter(n => !n.isBoss);
    if (!pool.length) return;
    setEncounterNpc(pool[Math.floor(Math.random() * pool.length)]);
    setPhase("encounter");
  };

  const startFight = async (npcId: number) => {
    if (!selectedChar) return;
    const battle = await startBattle.mutateAsync({ data: { characterId: selectedChar, npcId } });
    qc.invalidateQueries({ queryKey: getListBattlesQueryKey() });
    navigate(`/battle/${battle.id}`);
  };

  const selectedCharObj = characters.find(c => c.id === selectedChar);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-muted-foreground animate-pulse font-serif text-lg">Đang tải thế giới…</div>
    </div>
  );

  if (!world) return (
    <div className="text-center py-16 text-muted-foreground">
      <p>Thế giới không tồn tại.</p>
      <Link href="/worlds"><Button className="mt-4" variant="outline">Quay lại</Button></Link>
    </div>
  );

  const bosses  = npcs.filter(n => n.isBoss);
  const regulars = npcs.filter(n => !n.isBoss);

  /* ══ GATE ═══════════════════════════════════════════════ */
  if (phase === "gate") {
    return (
      <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b ${t.grad} overflow-hidden`}>
        <WorldScene theme={world.theme} />

        <div className="absolute top-6 left-6 z-20">
          <Link href="/worlds">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white backdrop-blur-sm bg-black/20">
              <ArrowLeft className="w-4 h-4 mr-1" /> Bản Đồ
            </Button>
          </Link>
        </div>

        {/* Gate panel */}
        <div
          className={`relative z-10 text-center px-6 max-w-lg transition-all duration-700 ${entering ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
        >
          <div className="mb-5">
            <MapPin className={`w-14 h-14 mx-auto ${t.accent} drop-shadow-2xl`} />
          </div>

          <h1 className={`text-5xl font-bold font-serif uppercase tracking-widest mb-4 ${t.accent} drop-shadow-lg`}>
            {world.name}
          </h1>

          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            <Badge variant="outline" className={`border-current ${t.accent} text-sm`}>{world.theme}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/60 text-sm">Yêu cầu cấp {world.minLevel}</Badge>
            {world.isBossWorld && <Badge className="bg-primary/20 text-primary border-primary/40 border text-sm">👑 Boss World</Badge>}
          </div>

          <p className={`text-white/70 text-base leading-relaxed mb-7 italic px-4 py-3 rounded-xl bg-black/20 backdrop-blur border ${t.border}`}>
            "{world.description}"
          </p>

          {/* Char selector */}
          {characters.length > 0 ? (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Chọn nhân vật bước vào</p>
              <div className="flex flex-wrap justify-center gap-2">
                {characters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChar(c.id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedChar === c.id
                        ? `border-current ${t.accent} bg-white/15 shadow-lg`
                        : "border-white/20 text-white/50 hover:text-white/80 hover:border-white/40"
                    }`}
                  >
                    <span className="mr-1">{CLASS_ICONS[c.class] ?? "⚔️"}</span>
                    {c.name}
                    <span className="opacity-50 text-xs ml-1">Cấp {c.level}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-sm mb-6">
              <Link href="/characters/new" className="text-primary underline">Tạo nhân vật</Link>{" "}để nhập vai.
            </p>
          )}

          <button
            disabled={!selectedChar || entering}
            onClick={handleEnter}
            className={`group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-serif text-lg uppercase tracking-widest font-bold border-2 transition-all duration-300 backdrop-blur-sm
              ${!selectedChar
                ? "opacity-30 cursor-not-allowed border-white/20 text-white/40"
                : `border-current ${t.accent} hover:bg-white/10 active:scale-95 cursor-pointer shadow-2xl`}`}
          >
            <Footprints className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {entering ? "Đang bước vào…" : "Bước Vào Thế Giới"}
            <Footprints className="w-5 h-5 scale-x-[-1] group-hover:-translate-x-1 transition-transform" />
          </button>

          <p className="text-white/30 text-xs mt-4">{world.npcCount} sinh vật đang chờ bạn bên trong</p>
        </div>
      </div>
    );
  }

  /* ══ ENCOUNTER ══════════════════════════════════════════ */
  if (phase === "encounter" && encounterNpc) {
    const line = t.encounterLines[Math.floor(Math.random() * t.encounterLines.length)];
    return (
      <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b ${t.grad} overflow-hidden`}>
        <WorldScene theme={world.theme} />
        <div className="relative z-10 w-full max-w-md px-6 space-y-5"
          style={{ animation: "entranceWalk 0.5s ease-out" }}>

          {/* Alert */}
          <div className={`rounded-2xl border-2 ${t.border} bg-black/60 backdrop-blur px-6 py-5 text-center`}>
            <div className="text-4xl mb-2">⚠️</div>
            <p className={`text-xs font-mono ${t.accent} uppercase tracking-widest mb-2`}>Chạm Trán Kẻ Thù!</p>
            <p className="text-white/70 text-sm italic">"{line}"</p>
          </div>

          {/* VS card */}
          <div className={`rounded-2xl border-2 ${encounterNpc.isBoss ? "border-primary/60" : t.border} bg-black/50 backdrop-blur p-5`}>
            {/* Character vs NPC */}
            <div className="flex items-center justify-between mb-5">
              {/* Hero side */}
              <div className="text-center flex-1">
                <div className="text-5xl mb-1" style={{ animation: "idleBob 2s ease-in-out infinite" }}>
                  {CLASS_ICONS[selectedCharObj?.class ?? ""] ?? "⚔️"}
                </div>
                <div className={`text-xs font-bold ${t.accent}`}>{selectedCharObj?.name}</div>
                <div className="text-xs text-white/40">Cấp {selectedCharObj?.level}</div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-1 px-4">
                <Swords className="w-7 h-7 text-primary" />
                <span className="text-xs text-white/30 font-bold uppercase tracking-wider">VS</span>
              </div>

              {/* Enemy side */}
              <div className="text-center flex-1">
                <div className="text-5xl mb-1" style={{ animation: "idleBob 2.4s ease-in-out 0.3s infinite" }}>
                  {encounterNpc.isBoss ? "👹" : encounterNpc.type === "Beast" ? "🐺" : encounterNpc.type === "Undead" ? "💀" : "👾"}
                </div>
                <div className="text-xs font-bold text-orange-300">{encounterNpc.name}</div>
                <div className="text-xs text-white/40">Cấp {encounterNpc.level}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-white/10 pt-4">
              <div className="bg-black/30 rounded-lg p-2">
                <Shield className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="font-bold text-white">{encounterNpc.hp}</div>
                <div className="text-white/40">HP</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <Star className="w-4 h-4 mx-auto text-secondary mb-1" />
                <div className="font-bold text-secondary">{encounterNpc.xpReward}</div>
                <div className="text-white/40">XP</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <span className="text-amber-400 block text-lg leading-none mb-0.5">G</span>
                <div className="font-bold text-amber-400">{encounterNpc.goldReward}</div>
                <div className="text-white/40">Gold</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 font-serif uppercase tracking-wider text-base" disabled={startBattle.isPending} onClick={() => startFight(encounterNpc.id)}>
              <Swords className="w-4 h-4 mr-2" />
              {startBattle.isPending ? "Đang vào trận…" : "Chiến Đấu!"}
            </Button>
            <Button size="lg" variant="outline" className={`border-current ${t.accent} font-serif uppercase`} onClick={() => setPhase("explore")}>
              <Wind className="w-4 h-4 mr-1" /> Né
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ══ EXPLORE ════════════════════════════════════════════ */
  return (
    <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${t.grad} overflow-hidden`}>
      <WorldScene theme={world.theme} />

      {/* Top bar */}
      <div className="relative z-10 sticky top-16 bg-black/40 backdrop-blur border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
        <button onClick={() => setPhase("gate")} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className={`font-serif font-bold ${t.accent}`}>{world.name}</span>
        </button>
        {selectedCharObj && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{CLASS_ICONS[selectedCharObj.class] ?? "⚔️"}</span>
            <span className="text-white/80 font-medium">{selectedCharObj.name}</span>
            <span>Cấp {selectedCharObj.level}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Walking character + ambience */}
        <div className="text-center space-y-3">
          {showCharacter && (
            <div className="text-6xl" style={{ animation: "entranceWalk 0.6s ease-out, idleBob 2.5s ease-in-out 0.6s infinite" }}>
              {CLASS_ICONS[selectedCharObj?.class ?? ""] ?? "⚔️"}
            </div>
          )}
          <p className={`text-xs font-mono ${t.accent} uppercase tracking-widest`}>Đang khám phá {world.name}</p>
          <p className="text-white/60 text-sm italic min-h-[2.5rem] transition-all duration-1000">
            {t.ambience[ambienceIdx]}
          </p>
        </div>

        {/* Explore button */}
        <div className="text-center">
          <button
            onClick={handleExplore}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-serif font-bold text-base uppercase tracking-widest border-2 transition-all duration-200 active:scale-95 backdrop-blur-sm bg-black/20 cursor-pointer border-current ${t.accent} hover:bg-white/10 shadow-xl`}
          >
            <Footprints className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Khám Phá Ngẫu Nhiên
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-white/30 text-xs mt-2">Tiến vào bóng tối — bạn không biết điều gì đang chờ…</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30 uppercase tracking-widest">hoặc chọn mục tiêu</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Regular enemies */}
        {regulars.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Skull className="w-3.5 h-3.5" /> Kẻ Địch ({regulars.length})
            </h3>
            {regulars.map(npc => (
              <div key={npc.id} className={`flex items-center justify-between gap-3 rounded-xl border ${t.border} bg-black/30 backdrop-blur px-4 py-3 hover:bg-white/5 transition-colors`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">
                    {npc.type === "Beast" ? "🐺" : npc.type === "Undead" ? "💀" : npc.type === "Elemental" ? "🔥" : "👾"}
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-white/90 text-sm truncate">{npc.name}</div>
                    <div className="text-xs text-white/40">{npc.type} · Cấp {npc.level} · {npc.hp} HP</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`border text-xs ${DIFF[npc.difficulty] ?? ""}`}>{npc.difficulty}</Badge>
                  <button
                    disabled={!selectedChar || startBattle.isPending}
                    onClick={() => startFight(npc.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-serif font-bold uppercase tracking-wider transition-all active:scale-95
                      ${!selectedChar ? "opacity-30 cursor-not-allowed border-white/20 text-white/40" : `border-current ${t.accent} hover:bg-white/10 cursor-pointer`}`}
                  >
                    <Swords className="w-3 h-3" /> Đánh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boss */}
        {bosses.map(npc => (
          <div key={npc.id} className="rounded-2xl border-2 border-primary/60 bg-black/50 backdrop-blur p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl" style={{ animation: "idleBob 3s ease-in-out infinite" }}>👹</span>
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-serif font-bold text-xl text-primary">{npc.name}</span>
                </div>
                <p className="text-white/40 text-sm">{npc.type} · Cấp {npc.level} · {npc.hp} HP</p>
              </div>
              <Badge className="ml-auto border bg-red-900/40 text-red-300 border-red-700/50">BOSS</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[["HP", npc.hp, "text-primary"],["XP", npc.xpReward, "text-secondary"],["Gold", npc.goldReward, "text-amber-400"]].map(([l,v,c])=>(
                <div key={String(l)} className="bg-black/40 rounded-lg p-2">
                  <div className={`font-bold text-lg ${c}`}>{v}</div>
                  <div className="text-white/30">{l}</div>
                </div>
              ))}
            </div>
            <button
              disabled={!selectedChar || startBattle.isPending}
              onClick={() => startFight(npc.id)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-primary text-primary font-serif font-bold text-sm uppercase tracking-widest transition-all hover:bg-primary/20 active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Crown className="w-4 h-4" /> Thách Đấu Boss <Crown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
