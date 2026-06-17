import { Router } from "express";
import { db } from "@workspace/db";
import {
  battlesTable,
  charactersTable,
  characterStatsTable,
  npcsTable,
  inventoryTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { advanceQuestProgress } from "../utils/questProgress";
import {
  StartBattleBody,
  GetBattleParams,
  BattleActionParams,
  BattleActionBody,
} from "@workspace/api-zod";

const router = Router();

function calcDamage(
  attack: number,
  defense: number,
  critRate: number,
  defending = false
): { dmg: number; crit: boolean } {
  const base = Math.max(1, attack - defense * 0.5);
  const variance = 0.8 + Math.random() * 0.4;
  let dmg = Math.round(base * variance);
  const crit = Math.random() * 100 < critRate;
  if (crit) dmg *= 2;
  if (defending) dmg = Math.round(dmg * 0.5);
  return { dmg, crit };
}

function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.5);
}

const RARITY_POOL = [
  { rarity: "Thường", weight: 60 },
  { rarity: "Hiếm", weight: 30 },
  { rarity: "Sử Thi", weight: 8 },
  { rarity: "Huyền Thoại", weight: 2 },
];

const RARITY_BONUS: Record<string, { attack: [number, number]; defense: [number, number] }> = {
  "Thường":      { attack: [1, 3],   defense: [1, 2]  },
  "Hiếm":        { attack: [4, 7],   defense: [3, 5]  },
  "Sử Thi":      { attack: [8, 12],  defense: [6, 9]  },
  "Huyền Thoại": { attack: [13, 20], defense: [10, 15] },
};

function rollRarity(minRarity?: string): string {
  if (minRarity === "Hiếm") {
    const pool = RARITY_POOL.filter((r) => r.rarity !== "Thường");
    const total = pool.reduce((s, r) => s + r.weight, 0);
    let rand = Math.random() * total;
    for (const entry of pool) {
      rand -= entry.weight;
      if (rand <= 0) return entry.rarity;
    }
    return "Hiếm";
  }
  const total = RARITY_POOL.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (const entry of RARITY_POOL) {
    rand -= entry.weight;
    if (rand <= 0) return entry.rarity;
  }
  return "Thường";
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const WEAPON_NAMES = ["Kiếm Gỗ", "Dao Ngắn", "Trượng Phép", "Cung Dài", "Búa Chiến", "Thương Bạc", "Kiếm Lửa", "Cung Mây"];
const ARMOR_NAMES = ["Áo Da", "Giáp Vải", "Giáp Xích", "Giáp Bản", "Áo Pháp Sư", "Giáp Rồng", "Áo Bóng Tối", "Giáp Thiên Sứ"];

async function maybeDropItem(characterId: number, npc: { isBoss: boolean; difficulty: string }): Promise<void> {
  const dropChance = npc.isBoss ? 1.0 : 0.3;
  if (Math.random() > dropChance) return;

  const type = Math.random() < 0.5 ? "weapon" : "armor";
  const minRarity = npc.isBoss ? "Hiếm" : undefined;
  const rarity = rollRarity(minRarity);
  const bonusRange = RARITY_BONUS[rarity];
  const atkBonus = rand(bonusRange.attack[0], bonusRange.attack[1]);
  const defBonus = rand(bonusRange.defense[0], bonusRange.defense[1]);
  const name =
    type === "weapon"
      ? WEAPON_NAMES[Math.floor(Math.random() * WEAPON_NAMES.length)]
      : ARMOR_NAMES[Math.floor(Math.random() * ARMOR_NAMES.length)];

  await db.insert(inventoryTable).values({
    characterId,
    name: `${name} [${rarity}]`,
    type,
    rarity,
    attackBonus: atkBonus,
    defenseBonus: defBonus,
    isEquipped: false,
  });
}

router.get("/battles", async (_req, res) => {
  const battles = await db
    .select()
    .from(battlesTable)
    .orderBy(battlesTable.createdAt);
  res.json(battles.reverse());
});

router.post("/battles", async (req, res) => {
  const parsed = StartBattleBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { characterId, npcId } = parsed.data;

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, characterId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  const [npc] = await db
    .select()
    .from(npcsTable)
    .where(eq(npcsTable.id, npcId));
  if (!npc) return res.status(404).json({ error: "NPC not found" });

  const [battle] = await db
    .insert(battlesTable)
    .values({
      characterId,
      npcId,
      status: "active",
      currentTurn: 1,
      characterHp: character.hp,
      npcHp: npc.hp,
      log: [`Trận chiến bắt đầu! ${character.name} vs ${npc.name}`],
    })
    .returning();

  res.status(201).json(battle);
});

router.get("/battles/:id", async (req, res) => {
  const parsed = GetBattleParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [battle] = await db
    .select()
    .from(battlesTable)
    .where(eq(battlesTable.id, parsed.data.id));
  if (!battle) return res.status(404).json({ error: "Battle not found" });
  res.json(battle);
});

router.post("/battles/:id/action", async (req, res) => {
  const paramsParsed = BattleActionParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = BattleActionBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid action" });

  const { id } = paramsParsed.data;
  const { action } = bodyParsed.data;

  const [battle] = await db
    .select()
    .from(battlesTable)
    .where(eq(battlesTable.id, id));
  if (!battle) return res.status(404).json({ error: "Battle not found" });
  if (battle.status !== "active") {
    return res.status(400).json({ error: "Battle is already over" });
  }

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, battle.characterId));
  const [stats] = await db
    .select()
    .from(characterStatsTable)
    .where(eq(characterStatsTable.characterId, battle.characterId));
  const [npc] = await db
    .select()
    .from(npcsTable)
    .where(eq(npcsTable.id, battle.npcId));

  if (!character || !stats || !npc) {
    return res.status(404).json({ error: "Missing battle participants" });
  }

  const newLog: string[] = [];
  let { characterHp, npcHp } = battle;
  let status = "active";
  let isDefending = false;
  let xpGained: number | null = null;
  let goldGained: number | null = null;

  if (action === "flee") {
    const success = Math.random() < 0.5;
    if (success) {
      status = "fled";
      newLog.push(`${character.name} đã tẩu thoát thành công!`);
    } else {
      newLog.push(`${character.name} tẩu thoát thất bại! Mất lượt.`);
    }
  } else if (action === "defend") {
    isDefending = true;
    newLog.push(`${character.name} vào tư thế phòng thủ! Giảm 50% sát thương nhận vào.`);
  } else if (action === "skill") {
    const skillDmg = Math.max(1, Math.round(stats.attack * 1.8 - npc.hp * 0.02));
    npcHp = Math.max(0, npcHp - skillDmg);
    newLog.push(`${character.name} sử dụng KỸ NĂNG! Gây ${skillDmg} sát thương lên ${npc.name}!`);
  } else {
    const { dmg, crit } = calcDamage(stats.attack, Math.max(0, npc.level * 0.5), stats.critRate);
    npcHp = Math.max(0, npcHp - dmg);
    newLog.push(
      crit
        ? `${character.name} tấn công CHÍ MẠNG! Gây ${dmg} sát thương!`
        : `${character.name} tấn công ${npc.name}. Gây ${dmg} sát thương.`
    );
  }

  if (npcHp <= 0) {
    status = "won";
    xpGained = npc.xpReward;
    goldGained = npc.goldReward;
    newLog.push(`${npc.name} đã bị đánh bại! Nhận ${npc.xpReward} XP và ${npc.goldReward} gold!`);
  }

  if (status === "active") {
    const npcAttack = Math.max(5, npc.level * 2 + 3);
    const npcCrit = npc.level * 2;
    const { dmg: npcDmg, crit: npcCritHit } = calcDamage(
      npcAttack,
      stats.defense,
      npcCrit,
      isDefending
    );
    characterHp = Math.max(0, characterHp - npcDmg);
    newLog.push(
      npcCritHit
        ? `${npc.name} phản công CHÍ MẠNG! Gây ${npcDmg} sát thương${isDefending ? " (đã giảm)" : ""}!`
        : `${npc.name} phản công. Gây ${npcDmg} sát thương${isDefending ? " (đã giảm)" : ""}.`
    );

    if (characterHp <= 0) {
      status = "lost";
      newLog.push(`${character.name} đã ngã xuống... Thất bại!`);
    }
  }

  const fullLog = [...battle.log, ...newLog];

  const [updatedBattle] = await db
    .update(battlesTable)
    .set({
      status,
      currentTurn: battle.currentTurn + 1,
      characterHp,
      npcHp,
      xpGained,
      goldGained,
      log: fullLog,
    })
    .where(eq(battlesTable.id, id))
    .returning();

  const isOver = status !== "active";

  if (status === "won") {
    const newXp = character.xp + (xpGained ?? 0);
    const newGold = character.gold + (goldGained ?? 0);
    let newLevel = character.level;
    let newXpToNext = character.xpToNext;
    let newMaxHp = character.maxHp;
    let levelUpMsg = "";

    if (newXp >= character.xpToNext) {
      newLevel = character.level + 1;
      newXpToNext = xpForLevel(newLevel);
      newMaxHp = character.maxHp + 10;
      levelUpMsg = ` -- LEVEL UP! ${character.name} đạt cấp ${newLevel}!`;
      await db
        .update(characterStatsTable)
        .set({
          attack: stats.attack + 2,
          defense: stats.defense + 1,
          speed: stats.speed + 1,
        })
        .where(eq(characterStatsTable.characterId, character.id));
    }

    await db
      .update(charactersTable)
      .set({
        xp: newXp,
        gold: newGold,
        level: newLevel,
        xpToNext: newXpToNext,
        maxHp: newMaxHp,
        hp: Math.min(character.hp + 20, newMaxHp),
      })
      .where(eq(charactersTable.id, character.id));

    await db
      .update(characterStatsTable)
      .set({
        totalBattles: stats.totalBattles + 1,
        wins: stats.wins + 1,
      })
      .where(eq(characterStatsTable.characterId, character.id));

    await maybeDropItem(character.id, npc);
    await advanceQuestProgress(character.id, npc.id, npc.role);

    if (levelUpMsg) {
      updatedBattle.log = [...updatedBattle.log, levelUpMsg];
      await db
        .update(battlesTable)
        .set({ log: updatedBattle.log })
        .where(eq(battlesTable.id, id));
    }
  } else if (status === "lost") {
    const lostGold = Math.round(character.gold * 0.1);
    await db
      .update(charactersTable)
      .set({
        hp: 1,
        gold: Math.max(0, character.gold - lostGold),
      })
      .where(eq(charactersTable.id, character.id));
    await db
      .update(characterStatsTable)
      .set({
        totalBattles: stats.totalBattles + 1,
        losses: stats.losses + 1,
      })
      .where(eq(characterStatsTable.characterId, character.id));
  }

  const result = status === "won" ? "victory" : status === "lost" ? "defeat" : status === "fled" ? "fled" : null;

  res.json({
    battle: updatedBattle,
    log: newLog,
    isOver,
    result,
  });
});

export default router;
