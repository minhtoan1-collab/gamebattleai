import { useListCharacters, useGetProgressionSummary, useListWorlds } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Sword, Globe, Trophy, Shield, Zap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: characters = [] } = useListCharacters();
  const { data: summary } = useGetProgressionSummary();
  const { data: worlds = [] } = useListWorlds();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-center mb-4">
            <Sword className="w-16 h-16 text-primary drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-bold font-serif text-secondary tracking-widest uppercase">
            RPG World
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Bước vào những thế giới huyền bí. Chiến đấu. Trưởng thành. Trở thành huyền thoại.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/characters/new">
              <Button size="lg" className="font-serif tracking-wider uppercase">
                <Sword className="w-4 h-4 mr-2" />
                Tạo Nhân Vật
              </Button>
            </Link>
            <Link href="/worlds">
              <Button size="lg" variant="outline" className="font-serif tracking-wider uppercase border-secondary text-secondary hover:bg-secondary/10">
                <Globe className="w-4 h-4 mr-2" />
                Khám Phá
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      {summary && (
        <section>
          <h2 className="text-xl font-bold font-serif text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Thống Kê Thế Giới
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Nhân Vật", value: summary.totalCharacters, icon: Users },
              { label: "Trận Chiến", value: summary.totalBattles, icon: Sword },
              { label: "NPC Bại Trận", value: summary.totalNpcsDefeated, icon: Shield },
              { label: "Thế Giới", value: summary.worldsExplored, icon: Globe },
              { label: "Lớp Thịnh Hành", value: summary.topClass, icon: Zap },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="bg-card border-border text-center">
                  <CardContent className="pt-4 pb-4">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary">{s.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Characters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-serif text-secondary uppercase tracking-widest flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Nhân Vật Của Bạn
          </h2>
          <Link href="/characters">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary text-xs uppercase tracking-wider">
              Xem tất cả
            </Button>
          </Link>
        </div>
        {characters.length === 0 ? (
          <Card className="border-dashed border-border bg-card/50">
            <CardContent className="py-10 text-center text-muted-foreground">
              <Sword className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có nhân vật nào. Hãy tạo nhân vật đầu tiên!</p>
              <Link href="/characters/new">
                <Button className="mt-4" size="sm">Tạo Ngay</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {characters.slice(0, 6).map((c) => {
              const xpPercent = Math.min(100, Math.round((c.xp / c.xpToNext) * 100));
              return (
                <Link key={c.id} href={`/characters/${c.id}`}>
                  <Card className="bg-card border-border hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-serif text-foreground group-hover:text-secondary transition-colors">{c.name}</CardTitle>
                        <Badge variant="outline" className="text-xs border-primary/40 text-primary">{c.class}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Cấp <span className="text-secondary font-bold">{c.level}</span></span>
                        <span className="text-primary">{c.hp}/{c.maxHp} HP</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(c.hp / c.maxHp) * 100}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground">XP: {c.xp}/{c.xpToNext}</div>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div className="bg-secondary h-1 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Worlds Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-serif text-secondary uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Thế Giới Phiêu Lưu
          </h2>
          <Link href="/worlds">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary text-xs uppercase tracking-wider">
              Xem tất cả
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {worlds.slice(0, 3).map((w) => (
            <Link key={w.id} href={`/worlds/${w.id}`}>
              <Card className="bg-card border-border hover:border-secondary/50 transition-all cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-serif text-foreground group-hover:text-secondary transition-colors">{w.name}</CardTitle>
                    {w.isBossWorld && <Badge className="text-xs bg-primary/20 text-primary border-primary/40 border">Boss</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{w.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Yêu cầu cấp <span className="text-secondary font-bold">{w.minLevel}</span></span>
                    <span className="text-muted-foreground">{w.npcCount} NPC</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
