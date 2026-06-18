import { db } from "@workspace/db";
import { characterStatsTable, inventoryTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { CharacterStats } from "@workspace/db";

export interface EffectiveStats {
  base: CharacterStats;
  effectiveAttack: number;
  effectiveDefense: number;
  speed: number;
  critRate: number;
}

export async function getEffectiveStats(characterId: number): Promise<EffectiveStats> {
  const [base] = await db
    .select()
    .from(characterStatsTable)
    .where(eq(characterStatsTable.characterId, characterId));

  if (!base) {
    throw new Error(`No character_stats found for characterId ${characterId}`);
  }

  const equipped = await db
    .select()
    .from(inventoryTable)
    .where(
      and(
        eq(inventoryTable.characterId, characterId),
        eq(inventoryTable.isEquipped, true),
      ),
    );

  const attackBonus = equipped.reduce((sum, item) => sum + item.attackBonus, 0);
  const defenseBonus = equipped.reduce((sum, item) => sum + item.defenseBonus, 0);

  return {
    base,
    effectiveAttack: base.attack + attackBonus,
    effectiveDefense: base.defense + defenseBonus,
    speed: base.speed,
    critRate: base.critRate,
  };
}
