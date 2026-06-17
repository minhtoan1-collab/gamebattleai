import { useGetCharacter, useGetCharacterStats, useGetInventory, useEquipItem, useDeleteCharacter, getGetCharacterQueryKey, getGetInventoryQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Sword, Shield, Zap, Target, Trash2, ArrowLeft, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

const RARITY_STYLES: Record<string, string> = {
  "Thường": "border-zinc-600 text-zinc-400",
  "Hiếm": "border-blue-500 text-blue-400",
  "Sử Thi": "border-purple-500 text-purple-400",
  "Huyền Thoại": "border-yellow-500 text-yellow-400",
};

export default function CharacterDetail({ id }: { id: number }) {
  const { data: character, isLoading } = useGetCharacter(id, { query: { enabled: !!id } });
  const { data: stats } = useGetCharacterStats(id, { query: { enabled: !!id } });
  const { data: inventory = [] } = useGetInventory(id, { query: { enabled: !!id } });
  const equipItem = useEquipItem();
  const deleteCharacter = useDeleteCharacter();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!character) return (
    <div className="text-center py-16 text-muted-foreground">
      <p>Nhân vật không tồn tại.</p>
      <Link href="/characters"><Button className="mt-4" variant="outline">Quay lại</Button></Link>
    </div>
  );

  const xpPercent = Math.min(100, Math.round((character.xp / character.xpToNext) * 100));
  const hpPercent = Math.min(100, Math.round((character.hp / character.maxHp) * 100));

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/characters">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-serif text-secondary tracking-wider">{character.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-primary/40 text-primary">{character.class}</Badge>
              <span className="text-muted-foreground text-sm">Cấp <span className="text-secondary font-bold">{character.level}</span></span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteCharacter.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-serif uppercase tracking-wider text-muted-foreground">Trạng Thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" />HP</span>
                <span className="text-primary font-medium">{character.hp}/{character.maxHp}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-secondary" />XP</span>
                <span className="text-secondary font-medium">{character.xp}/{character.xpToNext}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Vàng</span>
              <span className="text-amber-400 font-bold">{character.gold}</span>
            </div>
            {(character.equippedWeapon || character.equippedArmor) && (
              <div className="border-t border-border pt-3 space-y-1 text-sm">
                {character.equippedWeapon && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vũ khí</span>
                    <span className="text-foreground text-xs">{character.equippedWeapon}</span>
                  </div>
                )}
                {character.equippedArmor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giáp</span>
                    <span className="text-foreground text-xs">{character.equippedArmor}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-serif uppercase tracking-wider text-muted-foreground">Chỉ Số Chiến Đấu</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tấn Công", val: stats.attack, icon: Sword, color: "text-red-400" },
                  { label: "Phòng Thủ", val: stats.defense, icon: Shield, color: "text-blue-400" },
                  { label: "Tốc Độ", val: stats.speed, icon: Zap, color: "text-green-400" },
                  { label: "Chí Mạng", val: `${stats.critRate}%`, icon: Target, color: "text-purple-400" },
                  { label: "Tổng Trận", val: stats.totalBattles, icon: Sword, color: "text-muted-foreground" },
                  { label: "Thắng/Thua", val: `${stats.wins}/${stats.losses}`, icon: Shield, color: "text-secondary" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-2 bg-background/40 rounded-lg p-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${s.color}`} />
                      <div>
                        <div className={`font-bold text-sm ${s.color}`}>{s.val}</div>
                        <div className="text-[11px] text-muted-foreground">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Đang tải chỉ số...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/worlds">
          <Button className="font-serif tracking-wider uppercase">
            <Sword className="w-4 h-4 mr-2" />
            Vào Chiến Đấu
          </Button>
        </Link>
      </div>

      {/* Inventory */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-serif uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="w-4 h-4" />
            Kho Đồ ({inventory.length} vật phẩm)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Kho đồ trống. Chiến đấu để nhận trang bị!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inventory.map((item) => {
                const rarityStyle = RARITY_STYLES[item.rarity] ?? "border-zinc-600 text-zinc-400";
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${rarityStyle} bg-background/20 ${item.isEquipped ? "ring-1 ring-secondary/60" : ""}`}
                  >
                    <div>
                      <div className="font-medium text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.type === "weapon" ? "Vũ khí" : "Giáp"}
                        {item.attackBonus > 0 && ` · +${item.attackBonus} ATK`}
                        {item.defenseBonus > 0 && ` · +${item.defenseBonus} DEF`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isEquipped ? (
                        <Badge className="text-xs bg-secondary/20 text-secondary border-secondary/40 border">Trang bị</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-border hover:border-secondary hover:text-secondary"
                          onClick={() => handleEquip(item.id)}
                          disabled={equipItem.isPending}
                        >
                          Trang bị
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
