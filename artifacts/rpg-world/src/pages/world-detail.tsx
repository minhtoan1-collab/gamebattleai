import {
  useGetWorld,
  useListWorldNpcs,
  useListCharacters,
  useStartBattle,
  getListBattlesQueryKey,
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, Sword, Crown, Shield, Star, ChevronRight,
  MapPin, Skull, Footprints, Users, Swords, Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/* ── Theme config per world ─────────────────────────────────── */
const WORLD_THEMES: Record<string, {
  gradient: string;
  border: string;
  accent: string;
  fog: string;
  ambience: string[];
  encounterLines: string[];
}> = {
  Nature: {
    gradient: "from-green-950 via-emerald-950 to-stone-950",
    border: "border-green-800/50",
    accent: "text-green-400",
    fog: "bg-green-900/10",
    ambience: [
      "Gió thổi xào xạc qua những tán cây cổ thụ ngàn năm…",
      "Tiếng hú của loài thú hoang vọng lại từ xa…",
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
    gradient: "from-violet-950 via-slate-950 to-zinc-950",
    border: "border-purple-800/50",
    accent: "text-purple-400",
    fog: "bg-purple-900/10",
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
    gradient: "from-red-950 via-orange-950 to-stone-950",
    border: "border-red-800/50",
    accent: "text-orange-400",
    fog: "bg-orange-900/10",
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
    gradient: "from-amber-950 via-zinc-950 to-slate-950",
    border: "border-amber-800/50",
    accent: "text-amber-400",
    fog: "bg-amber-900/10",
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
    gradient: "from-yellow-950 via-indigo-950 to-slate-950",
    border: "border-yellow-700/50",
    accent: "text-yellow-400",
    fog: "bg-yellow-900/10",
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

const DIFFICULTY_STYLES: Record<string, { badge: string; label: string }> = {
  Easy:   { badge: "bg-green-900/40 text-green-300 border-green-700/50",   label: "Dễ"       },
  Normal: { badge: "bg-blue-900/40 text-blue-300 border-blue-700/50",     label: "Thường"   },
  Hard:   { badge: "bg-orange-900/40 text-orange-300 border-orange-700/50", label: "Khó"     },
  Boss:   { badge: "bg-red-900/40 text-red-300 border-red-700/50",         label: "Boss"     },
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

  const theme = WORLD_THEMES[world?.theme ?? ""] ?? WORLD_THEMES["Nature"];

  useEffect(() => {
    if (characters.length > 0 && selectedChar === null) {
      setSelectedChar(characters[0].id);
    }
  }, [characters, selectedChar]);

  // Rotate ambience text
  useEffect(() => {
    if (phase !== "explore") return;
    const t = setInterval(() => setAmbienceIdx((i) => (i + 1) % theme.ambience.length), 4000);
    return () => clearInterval(t);
  }, [phase, theme.ambience.length]);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => {
      setPhase("explore");
      setEntering(false);
    }, 1200);
  };

  const handleExplore = () => {
    const normalNpcs = npcs.filter((n) => !n.isBoss);
    if (normalNpcs.length === 0) return;
    const picked = normalNpcs[Math.floor(Math.random() * normalNpcs.length)];
    setEncounterNpc(picked);
    setPhase("encounter");
  };

  const handleFightEncounter = async () => {
    if (!selectedChar || !encounterNpc) return;
    const battle = await startBattle.mutateAsync({
      data: { characterId: selectedChar, npcId: encounterNpc.id },
    });
    qc.invalidateQueries({ queryKey: getListBattlesQueryKey() });
    navigate(`/battle/${battle.id}`);
  };

  const handleFightDirect = async (npcId: number) => {
    if (!selectedChar) return;
    const battle = await startBattle.mutateAsync({
      data: { characterId: selectedChar, npcId },
    });
    qc.invalidateQueries({ queryKey: getListBattlesQueryKey() });
    navigate(`/battle/${battle.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Thế giới không tồn tại.</p>
        <Link href="/worlds">
          <Button className="mt-4" variant="outline">Quay lại</Button>
        </Link>
      </div>
    );
  }

  /* ── PHASE: GATE ──────────────────────────────────────────── */
  if (phase === "gate") {
    return (
      <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b ${theme.gradient} overflow-hidden`}>
        {/* Fog overlay */}
        <div className={`absolute inset-0 ${theme.fog} pointer-events-none`} />

        {/* Back */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/worlds">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Bản Đồ
            </Button>
          </Link>
        </div>

        {/* Gate content */}
        <div className={`relative z-10 text-center px-6 max-w-xl transition-opacity duration-700 ${entering ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{ transition: "opacity 0.8s, transform 0.8s" }}>
          {/* Icon */}
          <div className="mb-6">
            <MapPin className={`w-16 h-16 mx-auto ${theme.accent} drop-shadow-lg`} />
          </div>

          {/* World name */}
          <h1 className={`text-5xl font-bold font-serif tracking-widest uppercase mb-3 ${theme.accent} drop-shadow`}>
            {world.name}
          </h1>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="outline" className={`border-current ${theme.accent} text-sm`}>
              {world.theme}
            </Badge>
            <Badge variant="outline" className="border-muted text-muted-foreground text-sm">
              Yêu cầu cấp {world.minLevel}
            </Badge>
            {world.isBossWorld && (
              <Badge className="bg-primary/20 text-primary border-primary/40 border text-sm flex items-center gap-1">
                <Crown className="w-3 h-3" /> Boss
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-foreground/80 text-base leading-relaxed mb-8 italic">
            "{world.description}"
          </p>

          {/* Character select */}
          {characters.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Chọn nhân vật nhập vai</p>
              <div className="flex flex-wrap justify-center gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChar(c.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedChar === c.id
                        ? `border-current ${theme.accent} bg-white/10`
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                    <span className="opacity-50 text-xs ml-1">Cấp {c.level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {characters.length === 0 && (
            <p className="text-muted-foreground text-sm mb-6">
              Bạn cần{" "}
              <Link href="/characters/new" className="text-primary underline">tạo nhân vật</Link>{" "}
              trước khi nhập vai.
            </p>
          )}

          {/* Enter button */}
          <button
            disabled={!selectedChar || entering}
            onClick={handleEnter}
            className={`group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl font-serif text-lg uppercase tracking-widest font-bold border-2 transition-all duration-300
              ${!selectedChar ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" :
                `border-current ${theme.accent} hover:bg-white/10 active:scale-95 cursor-pointer`}
            `}
          >
            <Footprints className="w-5 h-5" />
            {entering ? "Đang bước vào…" : "Bước Vào Thế Giới"}
            <Footprints className="w-5 h-5 scale-x-[-1]" />
          </button>

          <p className="text-xs text-muted-foreground mt-4">{world.npcCount} kẻ thù đang chờ bạn</p>
        </div>
      </div>
    );
  }

  /* ── PHASE: ENCOUNTER ─────────────────────────────────────── */
  if (phase === "encounter" && encounterNpc) {
    const encounterLine = theme.encounterLines[Math.floor(Math.random() * theme.encounterLines.length)];
    const ds = DIFFICULTY_STYLES[encounterNpc.difficulty] ?? DIFFICULTY_STYLES["Easy"];
    return (
      <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b ${theme.gradient} overflow-hidden`}>
        <div className={`absolute inset-0 ${theme.fog} pointer-events-none`} />

        <div className="relative z-10 text-center px-6 max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Alert */}
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-6 py-4">
            <Skull className="w-10 h-10 text-primary mx-auto mb-2 animate-bounce" />
            <p className={`text-sm font-mono ${theme.accent} mb-1 uppercase tracking-widest`}>Chạm Trán Kẻ Thù!</p>
            <p className="text-foreground/70 text-sm italic">"{encounterLine}"</p>
          </div>

          {/* NPC Card */}
          <div className={`rounded-2xl border-2 ${theme.border} bg-card/80 backdrop-blur p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold font-serif ${encounterNpc.isBoss ? "text-primary" : "text-foreground"}`}>
                  {encounterNpc.isBoss && <Crown className="w-5 h-5 inline mr-1 text-primary" />}
                  {encounterNpc.name}
                </h2>
                <p className="text-muted-foreground text-sm">{encounterNpc.type} · Cấp {encounterNpc.level}</p>
              </div>
              <Badge className={`border text-sm ${ds.badge}`}>{ds.label}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-background/50 rounded-lg p-3">
                <Shield className="w-4 h-4 mx-auto text-primary mb-1" />
                <div className="font-bold text-foreground">{encounterNpc.hp}</div>
                <div className="text-xs text-muted-foreground">HP</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <Star className="w-4 h-4 mx-auto text-secondary mb-1" />
                <div className="font-bold text-secondary">{encounterNpc.xpReward}</div>
                <div className="text-xs text-muted-foreground">XP Thưởng</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <span className="text-amber-400 text-lg block">G</span>
                <div className="font-bold text-amber-400">{encounterNpc.goldReward}</div>
                <div className="text-xs text-muted-foreground">Gold Thưởng</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              className="font-serif uppercase tracking-wider px-8"
              disabled={startBattle.isPending}
              onClick={handleFightEncounter}
            >
              <Swords className="w-4 h-4 mr-2" />
              {startBattle.isPending ? "Đang vào trận…" : "Chiến Đấu!"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`font-serif uppercase tracking-wider border-current ${theme.accent}`}
              onClick={() => setPhase("explore")}
            >
              <Wind className="w-4 h-4 mr-2" />
              Bỏ Qua
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PHASE: EXPLORE ───────────────────────────────────────── */
  const bosses = npcs.filter((n) => n.isBoss);
  const regulars = npcs.filter((n) => !n.isBoss);

  return (
    <div className={`relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-gradient-to-b ${theme.gradient} overflow-hidden`}>
      <div className={`absolute inset-0 ${theme.fog} pointer-events-none`} />

      {/* Top bar */}
      <div className="relative z-10 sticky top-16 border-b border-white/5 bg-black/30 backdrop-blur px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => setPhase("gate")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className={`font-serif font-bold ${theme.accent}`}>{world.name}</span>
        </button>

        {/* Char indicator */}
        {selectedChar && (() => {
          const c = characters.find((ch) => ch.id === selectedChar);
          return c ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{c.name}</span>
              <span>Cấp {c.level}</span>
            </div>
          ) : null;
        })()}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Ambience */}
        <div className="text-center space-y-2">
          <p className={`text-sm font-mono ${theme.accent} uppercase tracking-widest`}>
            Đang khám phá {world.name}
          </p>
          <p className="text-foreground/60 text-sm italic transition-opacity duration-1000 min-h-[2.5rem]">
            {theme.ambience[ambienceIdx]}
          </p>
        </div>

        {/* Explore button */}
        <div className="text-center">
          <button
            onClick={handleExplore}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-serif font-bold text-base uppercase tracking-widest border-2 transition-all duration-200 active:scale-95
              border-current ${theme.accent} hover:bg-white/10 cursor-pointer`}
          >
            <Footprints className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Khám Phá Ngẫu Nhiên
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-2">Tiến vào rừng sâu — bạn có thể gặp bất cứ điều gì…</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">hoặc chọn kẻ thù</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Regular enemies */}
        {regulars.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Skull className="w-3.5 h-3.5" /> Kẻ Địch Thường
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {regulars.map((npc) => {
                const ds = DIFFICULTY_STYLES[npc.difficulty] ?? DIFFICULTY_STYLES["Easy"];
                return (
                  <div
                    key={npc.id}
                    className={`flex items-center justify-between gap-4 rounded-xl border ${theme.border} bg-black/30 backdrop-blur px-4 py-3 group hover:bg-white/5 transition-colors`}
                  >
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-foreground text-sm truncate">{npc.name}</div>
                      <div className="text-xs text-muted-foreground">{npc.type} · Cấp {npc.level} · HP {npc.hp}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`border text-xs ${ds.badge}`}>{ds.label}</Badge>
                      <button
                        disabled={!selectedChar || startBattle.isPending}
                        onClick={() => handleFightDirect(npc.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-serif font-bold uppercase tracking-wider transition-all
                          ${!selectedChar ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" :
                            `border-current ${theme.accent} hover:bg-white/10 active:scale-95 cursor-pointer`}`}
                      >
                        <Swords className="w-3 h-3" />
                        Đánh
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Boss */}
        {bosses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-primary" /> Trùm Cuối
            </h3>
            {bosses.map((npc) => (
              <div
                key={npc.id}
                className="rounded-2xl border-2 border-primary/50 bg-primary/5 backdrop-blur p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-primary" />
                      <span className="font-serif font-bold text-xl text-primary">{npc.name}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{npc.type} · Cấp {npc.level}</p>
                  </div>
                  <Badge className="border text-sm bg-red-900/40 text-red-300 border-red-700/50">Boss</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { label: "HP", val: npc.hp, color: "text-primary" },
                    { label: "XP", val: npc.xpReward, color: "text-secondary" },
                    { label: "Gold", val: npc.goldReward, color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-black/30 rounded-lg p-2">
                      <div className={`font-bold text-base ${s.color}`}>{s.val}</div>
                      <div className="text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  disabled={!selectedChar || startBattle.isPending}
                  onClick={() => handleFightDirect(npc.id)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-serif font-bold text-sm uppercase tracking-widest transition-all hover:bg-primary/20 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Crown className="w-4 h-4" />
                  Thách Đấu Boss
                  <Crown className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
