import { useListCharacters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Plus, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CLASS_COLORS: Record<string, string> = {
  "Chiến Binh": "border-red-700/50 text-red-400",
  "Pháp Sư": "border-blue-600/50 text-blue-400",
  "Thích Khách": "border-purple-600/50 text-purple-400",
  "Cung Thủ": "border-green-600/50 text-green-400",
};

export default function Characters() {
  const { data: characters = [], isLoading } = useListCharacters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-secondary uppercase tracking-widest">
            Nhân Vật
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý và chiến đấu cùng các anh hùng của bạn</p>
        </div>
        <Link href="/characters/new">
          <Button className="font-serif tracking-wider uppercase">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Nhân Vật
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Sword className="w-12 h-12 mx-auto mb-4 opacity-30 text-primary" />
            <p className="text-base mb-2 font-serif text-foreground">Chưa có dũng sĩ nào</p>
            <p className="text-sm mb-6">Tạo nhân vật đầu tiên để bắt đầu hành trình</p>
            <Link href="/characters/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Nhân Vật Đầu Tiên
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {characters.map((c) => {
            const xpPercent = Math.min(100, Math.round((c.xp / c.xpToNext) * 100));
            const hpPercent = Math.min(100, Math.round((c.hp / c.maxHp) * 100));
            const classColor = CLASS_COLORS[c.class] ?? "border-muted text-muted-foreground";

            return (
              <Link key={c.id} href={`/characters/${c.id}`}>
                <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-serif text-foreground group-hover:text-secondary transition-colors leading-tight">
                        {c.name}
                      </CardTitle>
                      <Badge variant="outline" className={`text-xs shrink-0 ${classColor}`}>
                        {c.class}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Cấp <span className="text-secondary font-bold text-sm">{c.level}</span></span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-amber-500">{c.gold} vàng</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* HP */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Shield className="w-3 h-3" /> HP
                        </span>
                        <span className="text-primary font-medium">{c.hp}/{c.maxHp}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* XP */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" /> XP
                        </span>
                        <span className="text-secondary font-medium">{xpPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-secondary h-1.5 rounded-full transition-all"
                          style={{ width: `${xpPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Equipment */}
                    {(c.equippedWeapon || c.equippedArmor) && (
                      <div className="pt-1 text-xs text-muted-foreground space-y-1 border-t border-border">
                        {c.equippedWeapon && <div>Vũ khí: <span className="text-foreground">{c.equippedWeapon}</span></div>}
                        {c.equippedArmor && <div>Giáp: <span className="text-foreground">{c.equippedArmor}</span></div>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
