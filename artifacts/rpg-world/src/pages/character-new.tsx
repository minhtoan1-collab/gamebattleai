import { useState } from "react";
import { useCreateCharacter } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Sword, Shield, Zap, Target, ChevronRight } from "lucide-react";

const CLASSES = [
  {
    name: "Chiến Binh",
    label: "WARRIOR",
    emoji: "⚔️",
    icon: Shield,
    description: "Sức mạnh thể chất vượt trội. HP cao, phòng thủ kiên cố. Đứng vững trên mọi chiến trường.",
    lore: "Chiến binh không biết sợ hãi. Tấm khiên và thanh kiếm là tất cả.",
    stats: { HP: 140, ATK: 12, DEF: 10, SPD: 6, CRIT: "8%" },
    color: "#ff4040",
    glow: "rgba(255,40,40,0.8)",
    bg: "rgba(160,20,20,0.15)",
    border: "rgba(255,60,60,0.3)",
    activeBorder: "rgba(255,60,60,0.7)",
    bgFull: "linear-gradient(135deg,rgba(100,0,0,0.4) 0%,rgba(40,0,0,0.6) 100%)",
  },
  {
    name: "Pháp Sư",
    label: "MAGE",
    emoji: "🔮",
    icon: Zap,
    description: "Phép thuật hủy diệt tột cùng. Sát thương cao nhất nhưng HP mong manh như giấy.",
    lore: "Sức mạnh vô tận ẩn trong những câu thần chú. Nhưng chỉ một đòn trúng có thể là tử thần.",
    stats: { HP: 80, ATK: 18, DEF: 4, SPD: 8, CRIT: "12%" },
    color: "#7070ff",
    glow: "rgba(80,80,255,0.8)",
    bg: "rgba(20,20,160,0.15)",
    border: "rgba(80,80,255,0.3)",
    activeBorder: "rgba(80,80,255,0.7)",
    bgFull: "linear-gradient(135deg,rgba(0,0,100,0.4) 0%,rgba(0,0,50,0.6) 100%)",
  },
  {
    name: "Thích Khách",
    label: "ASSASSIN",
    emoji: "🗡️",
    icon: Sword,
    description: "Bóng tối và tốc độ. Chí mạng cao nhất, luôn ra đòn trước. Sát thương tối đa từ bóng tối.",
    lore: "Kẻ thù ngã xuống trước khi họ kịp nhận ra bạn xuất hiện.",
    stats: { HP: 90, ATK: 15, DEF: 6, SPD: 14, CRIT: "25%" },
    color: "#c070ff",
    glow: "rgba(160,60,255,0.8)",
    bg: "rgba(100,20,180,0.15)",
    border: "rgba(160,60,255,0.3)",
    activeBorder: "rgba(160,60,255,0.7)",
    bgFull: "linear-gradient(135deg,rgba(60,0,120,0.4) 0%,rgba(20,0,60,0.6) 100%)",
  },
  {
    name: "Cung Thủ",
    label: "ARCHER",
    emoji: "🏹",
    icon: Target,
    description: "Cân bằng hoàn hảo. Tấm xa ổn định, tốc độ cao. Linh hoạt trong mọi hoàn cảnh chiến đấu.",
    lore: "Từ khoảng cách an toàn, mỗi mũi tên đều là kết thúc.",
    stats: { HP: 100, ATK: 13, DEF: 7, SPD: 11, CRIT: "15%" },
    color: "#40c060",
    glow: "rgba(40,180,80,0.8)",
    bg: "rgba(20,120,40,0.15)",
    border: "rgba(40,180,80,0.3)",
    activeBorder: "rgba(40,180,80,0.7)",
    bgFull: "linear-gradient(135deg,rgba(0,80,20,0.4) 0%,rgba(0,40,10,0.6) 100%)",
  },
];

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase" style={{ color: "rgba(200,160,80,0.6)" }}>
        <span>{label}</span><span style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}88` }} />
      </div>
    </div>
  );
}

export default function CharacterNew() {
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState<typeof CLASSES[0] | null>(null);
  const [, navigate] = useLocation();
  const createCharacter = useCreateCharacter();

  const handleCreate = async () => {
    if (!name.trim() || !selectedClass) return;
    const result = await createCharacter.mutateAsync({ data: { name: name.trim(), class: selectedClass.name } });
    navigate(`/characters/${result.id}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="px-6 md:px-10 py-5 border-b relative"
        style={{ borderColor: "rgba(180,130,0,0.15)", background: "rgba(5,2,12,0.9)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.3),transparent)" }} />
        <h1 className="text-2xl font-black uppercase tracking-[0.2em]" style={{ color: "#f0c040", textShadow: "0 0 20px rgba(240,180,0,0.6)", fontFamily: "serif" }}>
          ✦ TẠO NHÂN VẬT
        </h1>
        <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "rgba(180,140,60,0.45)" }}>Chọn lớp nhân vật và đặt tên cho dũng sĩ của bạn</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left — Preview Panel */}
        <div
          className="lg:w-72 xl:w-80 shrink-0 flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r relative overflow-hidden"
          style={{
            borderColor: selectedClass ? `${selectedClass.color}20` : "rgba(180,130,0,0.12)",
            background: selectedClass ? selectedClass.bgFull : "rgba(5,2,12,0.6)",
            minHeight: "260px",
            transition: "all 0.4s ease",
          }}
        >
          {/* Animated rings */}
          {selectedClass && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[120, 180, 240].map((r, i) => (
                <div
                  key={r}
                  className="absolute rounded-full"
                  style={{
                    width: r, height: r,
                    border: `1px solid ${selectedClass.color}${15 - i * 4}`,
                    animation: `spin ${12 + i * 8}s linear ${i % 2 === 0 ? "" : "reverse"} infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {selectedClass ? (
            <div className="relative z-10 text-center space-y-4">
              <div
                className="text-8xl mx-auto"
                style={{
                  filter: `drop-shadow(0 0 20px ${selectedClass.glow}) drop-shadow(0 0 40px ${selectedClass.glow}66)`,
                  animation: "idleBob 2.5s ease-in-out infinite",
                }}
              >
                {selectedClass.emoji}
              </div>
              <div>
                <div className="font-black text-2xl uppercase tracking-widest" style={{ color: selectedClass.color, textShadow: `0 0 20px ${selectedClass.glow}`, fontFamily: "serif" }}>
                  {selectedClass.label}
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(200,160,80,0.6)", fontStyle: "italic" }}>
                  "{selectedClass.lore}"
                </div>
              </div>

              {/* Quick stats */}
              <div className="w-full space-y-2.5 text-left">
                <StatBar label="HP" value={selectedClass.stats.HP} max={150} color="#ff4040" />
                <StatBar label="ATK" value={selectedClass.stats.ATK} max={20} color={selectedClass.color} />
                <StatBar label="DEF" value={selectedClass.stats.DEF} max={12} color="#60a0ff" />
                <StatBar label="SPD" value={selectedClass.stats.SPD} max={16} color="#40c080" />
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30">
              <div className="text-6xl mb-3">⚔️</div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(200,160,80,0.6)" }}>Chọn lớp nhân vật</div>
            </div>
          )}
        </div>

        {/* Right — Selection */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
          {/* Class grid */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: "rgba(200,150,60,0.5)" }}>— CHỌN LỚP NHÂN VẬT —</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLASSES.map((cls) => {
                const isSelected = selectedClass?.name === cls.name;
                return (
                  <button
                    key={cls.name}
                    onClick={() => setSelectedClass(cls)}
                    className="text-left transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: isSelected ? cls.bgFull : `rgba(5,2,12,0.8)`,
                      border: `1px solid ${isSelected ? cls.activeBorder : cls.border}`,
                      boxShadow: isSelected ? `0 0 20px ${cls.glow}33, inset 0 0 30px ${cls.glow}08` : "none",
                      padding: "14px",
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${cls.color},transparent)`, boxShadow: `0 0 8px ${cls.glow}` }} />
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{cls.emoji}</span>
                      <div>
                        <div className="font-black text-sm uppercase tracking-wider" style={{ color: isSelected ? cls.color : "rgba(200,170,100,0.7)", fontFamily: "serif", textShadow: isSelected ? `0 0 12px ${cls.glow}` : "none" }}>
                          {cls.name}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: isSelected ? cls.color : "rgba(150,120,60,0.4)", opacity: 0.8 }}>
                          {cls.label}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-auto">
                          <div className="w-4 h-4 flex items-center justify-center rounded-full" style={{ background: cls.color, boxShadow: `0 0 8px ${cls.glow}` }}>
                            <span className="text-black text-[8px] font-black">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "rgba(180,150,80,0.55)" }}>{cls.description}</p>

                    {/* Mini stat grid */}
                    <div className="grid grid-cols-5 gap-1 mt-3">
                      {Object.entries(cls.stats).map(([k, v]) => (
                        <div key={k} className="text-center py-1 rounded" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${isSelected ? cls.color + "25" : "rgba(200,150,0,0.08)"}` }}>
                          <div className="text-[10px] font-black" style={{ color: isSelected ? cls.color : "rgba(200,170,100,0.6)" }}>{v}</div>
                          <div className="text-[8px] uppercase" style={{ color: "rgba(150,120,60,0.4)" }}>{k}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: "rgba(200,150,60,0.5)" }}>— TÊN NHÂN VẬT —</div>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập danh hiệu của dũng sĩ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full px-4 py-3 text-sm font-bold bg-transparent outline-none transition-all"
                style={{
                  border: `1px solid ${name ? "rgba(200,150,0,0.5)" : "rgba(180,130,0,0.2)"}`,
                  color: "#f0e8c0",
                  fontFamily: "serif",
                  letterSpacing: "0.05em",
                  background: "rgba(5,2,12,0.8)",
                  boxShadow: name ? "0 0 15px rgba(200,150,0,0.1) inset" : "none",
                }}
              />
              {name && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,0,0.6),transparent)" }}
                />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !selectedClass || createCharacter.isPending}
            className="w-full flex items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-[0.25em] transition-all duration-200 relative overflow-hidden"
            style={{
              background: !name.trim() || !selectedClass
                ? "rgba(30,20,5,0.6)"
                : `linear-gradient(135deg,rgba(180,100,0,0.95) 0%,rgba(120,60,0,1) 100%)`,
              border: !name.trim() || !selectedClass
                ? "1px solid rgba(150,100,0,0.15)"
                : "1px solid rgba(255,160,40,0.5)",
              color: !name.trim() || !selectedClass ? "rgba(180,140,60,0.3)" : "#fff",
              clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              textShadow: name.trim() && selectedClass ? "0 0 12px rgba(255,180,60,0.9)" : "none",
              boxShadow: name.trim() && selectedClass ? "0 0 25px rgba(180,100,0,0.35)" : "none",
              cursor: !name.trim() || !selectedClass || createCharacter.isPending ? "not-allowed" : "pointer",
            }}
          >
            <Sword className="w-5 h-5" />
            {createCharacter.isPending ? "ĐANG TẠO NHÂN VẬT..." : "BẮT ĐẦU HÀNH TRÌNH"}
            {!createCharacter.isPending && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
