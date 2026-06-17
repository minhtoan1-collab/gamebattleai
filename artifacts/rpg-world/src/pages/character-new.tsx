import { useState } from "react";
import { useCreateCharacter } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Sword, Shield, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CLASSES = [
  {
    name: "Chiến Binh",
    icon: Shield,
    description: "Sức mạnh thể chất vượt trội. HP cao, phòng thủ tốt. Thích hợp cho người mới bắt đầu.",
    stats: { hp: 140, atk: 12, def: 10, spd: 6, crit: 8 },
    color: "border-red-700 bg-red-900/10 text-red-400",
    active: "ring-2 ring-red-600",
  },
  {
    name: "Pháp Sư",
    icon: Zap,
    description: "Phép thuật hủy diệt. Sát thương cao nhất nhưng HP thấp. Dành cho người chơi táo bạo.",
    stats: { hp: 80, atk: 18, def: 4, spd: 8, crit: 12 },
    color: "border-blue-600 bg-blue-900/10 text-blue-400",
    active: "ring-2 ring-blue-500",
  },
  {
    name: "Thích Khách",
    icon: Sword,
    description: "Bóng tối và tốc độ. Chí mạng cao nhất, luôn ra đòn trước đối thủ. Rủi ro và phần thưởng cao.",
    stats: { hp: 90, atk: 15, def: 6, spd: 14, crit: 25 },
    color: "border-purple-600 bg-purple-900/10 text-purple-400",
    active: "ring-2 ring-purple-500",
  },
  {
    name: "Cung Thủ",
    icon: Target,
    description: "Cân bằng hoàn hảo giữa tấn công và phòng thủ. Tốc độ nhanh, ổn định trong mọi hoàn cảnh.",
    stats: { hp: 100, atk: 13, def: 7, spd: 11, crit: 15 },
    color: "border-green-600 bg-green-900/10 text-green-400",
    active: "ring-2 ring-green-500",
  },
];

export default function CharacterNew() {
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [, navigate] = useLocation();
  const createCharacter = useCreateCharacter();

  const handleCreate = async () => {
    if (!name.trim() || !selectedClass) return;
    const result = await createCharacter.mutateAsync({ data: { name: name.trim(), class: selectedClass } });
    navigate(`/characters/${result.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary uppercase tracking-widest">
          Tạo Nhân Vật
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Chọn lớp nhân vật và đặt tên cho dũng sĩ của bạn</p>
      </div>

      {/* Name Input */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif text-foreground">Tên Nhân Vật</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nhập tên dũng sĩ của bạn..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border focus:border-secondary text-foreground placeholder:text-muted-foreground"
            maxLength={30}
          />
        </CardContent>
      </Card>

      {/* Class Selection */}
      <div className="space-y-3">
        <Label className="text-base font-serif text-foreground uppercase tracking-wider">Chọn Lớp Nhân Vật</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CLASSES.map((cls) => {
            const Icon = cls.icon;
            const isSelected = selectedClass === cls.name;
            return (
              <button
                key={cls.name}
                onClick={() => setSelectedClass(cls.name)}
                className={`text-left rounded-lg border p-4 transition-all ${cls.color} ${isSelected ? cls.active : "opacity-70 hover:opacity-100"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-bold font-serif text-base">{cls.name}</span>
                  {isSelected && <span className="ml-auto text-xs uppercase tracking-wider opacity-80">Chon</span>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cls.description}</p>
                <div className="grid grid-cols-5 gap-1 text-xs text-center">
                  {[
                    { label: "HP", val: cls.stats.hp },
                    { label: "ATK", val: cls.stats.atk },
                    { label: "DEF", val: cls.stats.def },
                    { label: "SPD", val: cls.stats.spd },
                    { label: "CRIT", val: `${cls.stats.crit}%` },
                  ].map((s) => (
                    <div key={s.label} className="bg-background/40 rounded p-1">
                      <div className="font-bold">{s.val}</div>
                      <div className="text-muted-foreground text-[10px]">{s.label}</div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <Button
        size="lg"
        className="w-full font-serif tracking-wider uppercase text-base"
        disabled={!name.trim() || !selectedClass || createCharacter.isPending}
        onClick={handleCreate}
      >
        {createCharacter.isPending ? "Đang tạo..." : "Bắt Đầu Hành Trình"}
      </Button>
    </div>
  );
}
