import { useGetLeaderboard, useGetProgressionSummary } from "@workspace/api-client-react";
import { Trophy, Medal, Sword, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const CLASS_COLORS: Record<string, string> = {
  "Chiến Binh": "text-red-400",
  "Pháp Sư": "text-blue-400",
  "Thích Khách": "text-purple-400",
  "Cung Thủ": "text-green-400",
};

const RANK_ICONS: Record<number, { icon: typeof Trophy; color: string }> = {
  1: { icon: Trophy, color: "text-yellow-400" },
  2: { icon: Medal, color: "text-zinc-300" },
  3: { icon: Medal, color: "text-amber-600" },
};

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useGetLeaderboard();
  const { data: summary } = useGetProgressionSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-secondary uppercase tracking-widest flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          Bảng Xếp Hạng
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Những chiến binh hùng mạnh nhất của thế giới</p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Nhân Vật", value: summary.totalCharacters, icon: Users },
            { label: "Trận Chiến", value: summary.totalBattles, icon: Sword },
            { label: "NPC Bại Trận", value: summary.totalNpcsDefeated, icon: Shield },
            { label: "Lớp Phổ Biến", value: summary.topClass, icon: Trophy },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="bg-card border-border text-center">
                <CardContent className="pt-4 pb-3">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <div className="text-xl font-bold text-secondary">{s.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-sm font-serif uppercase tracking-widest text-muted-foreground">Bảng Xếp Hạng Toàn Cầu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có dữ liệu xếp hạng.</p>
              <Link href="/characters/new">
                <span className="text-primary text-xs hover:underline cursor-pointer">Tạo nhân vật đầu tiên</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Header Row */}
              <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 bg-background/30">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Nhân Vật</div>
                <div className="col-span-2 text-center">Cấp</div>
                <div className="col-span-2 text-center">Trận</div>
                <div className="col-span-2 text-center">Thắng</div>
              </div>
              {leaderboard.map((entry) => {
                const rankInfo = RANK_ICONS[entry.rank];
                const classColor = CLASS_COLORS[entry.class] ?? "text-muted-foreground";
                return (
                  <Link key={entry.characterId} href={`/characters/${entry.characterId}`}>
                    <div
                      className={`grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-muted/30 cursor-pointer ${entry.rank <= 3 ? "bg-secondary/5" : ""}`}
                    >
                      {/* Rank */}
                      <div className="col-span-1">
                        {rankInfo ? (
                          <rankInfo.icon className={`w-5 h-5 ${rankInfo.color}`} />
                        ) : (
                          <span className="text-muted-foreground text-sm font-mono">{entry.rank}</span>
                        )}
                      </div>

                      {/* Name + Class */}
                      <div className="col-span-5">
                        <div className="font-serif font-bold text-sm text-foreground">{entry.name}</div>
                        <Badge variant="outline" className={`text-[10px] border-current ${classColor} mt-0.5`}>
                          {entry.class}
                        </Badge>
                      </div>

                      {/* Level */}
                      <div className="col-span-2 text-center">
                        <span className="text-secondary font-bold">{entry.level}</span>
                      </div>

                      {/* Battles */}
                      <div className="col-span-2 text-center text-muted-foreground text-sm">
                        {entry.totalBattles}
                      </div>

                      {/* Wins */}
                      <div className="col-span-2 text-center">
                        <span className="text-green-400 font-medium text-sm">{entry.wins}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
