import { Router } from "express";
import { db } from "@workspace/db";
import {
  questsTable,
  characterQuestsTable,
  charactersTable,
  characterStatsTable,
  npcsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { adjustNpcRelationship, adjustWorldReputation } from "../utils/reputation";
import { unlockAvailableSkills } from "../utils/skillUnlock";

const router = Router();

function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.5);
}

router.get("/quests/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid quest id" });
  }
  const [quest] = await db.select().from(questsTable).where(eq(questsTable.id, id));
  if (!quest) return res.status(404).json({ error: "Quest not found" });
  res.json(quest);
});

router.post("/quests/:id/accept", async (req, res) => {
  const questId = Number(req.params.id);
  const characterId = Number(req.body?.characterId);

  if (!Number.isInteger(questId) || questId <= 0) {
    return res.status(400).json({ error: "Invalid quest id" });
  }
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "characterId must be a positive integer" });
  }

  const [quest] = await db.select().from(questsTable).where(eq(questsTable.id, questId));
  if (!quest) return res.status(404).json({ error: "Quest not found" });

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, characterId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  if (character.level < quest.requiredLevel) {
    return res.status(403).json({
      error: `Yêu cầu cấp ${quest.requiredLevel} để nhận nhiệm vụ này. Nhân vật hiện tại cấp ${character.level}.`,
    });
  }

  const [existing] = await db
    .select()
    .from(characterQuestsTable)
    .where(
      and(
        eq(characterQuestsTable.characterId, characterId),
        eq(characterQuestsTable.questId, questId)
      )
    );

  if (existing) {
    return res.status(409).json({ error: "Quest already accepted.", status: existing.status });
  }

  const [characterQuest] = await db
    .insert(characterQuestsTable)
    .values({ characterId, questId, status: "active", progress: 0 })
    .returning();

  res.status(201).json({ characterQuest, quest });
});

router.post("/quests/:id/claim", async (req, res) => {
  const questId = Number(req.params.id);
  const characterId = Number(req.body?.characterId);

  if (!Number.isInteger(questId) || questId <= 0) {
    return res.status(400).json({ error: "Invalid quest id" });
  }
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "characterId must be a positive integer" });
  }

  const [quest] = await db.select().from(questsTable).where(eq(questsTable.id, questId));
  if (!quest) return res.status(404).json({ error: "Quest not found" });

  const [cq] = await db
    .select()
    .from(characterQuestsTable)
    .where(
      and(
        eq(characterQuestsTable.characterId, characterId),
        eq(characterQuestsTable.questId, questId)
      )
    );

  if (!cq) return res.status(404).json({ error: "Quest not accepted." });
  if (cq.status === "claimed") return res.status(409).json({ error: "Rewards already claimed." });
  if (cq.status === "active") return res.status(400).json({ error: "Quest not yet completed." });

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, characterId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  const newXp = character.xp + quest.rewardXp;
  const newGold = character.gold + quest.rewardGold;
  let newLevel = character.level;
  let newXpToNext = character.xpToNext;
  let newMaxHp = character.maxHp;
  let levelUp = false;

  if (newXp >= character.xpToNext) {
    newLevel = character.level + 1;
    newXpToNext = xpForLevel(newLevel);
    newMaxHp = character.maxHp + 10;
    levelUp = true;

    const [stats] = await db
      .select()
      .from(characterStatsTable)
      .where(eq(characterStatsTable.characterId, characterId));
    if (stats) {
      await db
        .update(characterStatsTable)
        .set({ attack: stats.attack + 2, defense: stats.defense + 1, speed: stats.speed + 1 })
        .where(eq(characterStatsTable.characterId, characterId));
    }

    await unlockAvailableSkills(characterId, newLevel);
  }

  const [updatedCharacter] = await db
    .update(charactersTable)
    .set({ xp: newXp, gold: newGold, level: newLevel, xpToNext: newXpToNext, maxHp: newMaxHp })
    .where(eq(charactersTable.id, characterId))
    .returning();

  const [updatedCq] = await db
    .update(characterQuestsTable)
    .set({ status: "claimed" })
    .where(eq(characterQuestsTable.id, cq.id))
    .returning();

  if (quest.questGiverId != null) {
    await adjustNpcRelationship(characterId, quest.questGiverId, 15, "quest_claim", "quest", cq.id);
    const [giver] = await db.select().from(npcsTable).where(eq(npcsTable.id, quest.questGiverId));
    if (giver) await adjustWorldReputation(characterId, giver.worldId, 5, "quest_claim", "quest", cq.id);
  }

  res.json({
    rewards: { xp: quest.rewardXp, gold: quest.rewardGold },
    levelUp,
    character: updatedCharacter,
    characterQuest: updatedCq,
  });
});

router.get("/characters/:id/quests", async (req, res) => {
  const characterId = Number(req.params.id);
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }

  const rows = await db
    .select({ cq: characterQuestsTable, q: questsTable })
    .from(characterQuestsTable)
    .innerJoin(questsTable, eq(characterQuestsTable.questId, questsTable.id))
    .where(eq(characterQuestsTable.characterId, characterId));

  res.json(
    rows.map(({ cq, q }) => ({
      id: cq.id,
      status: cq.status,
      progress: cq.progress,
      completedAt: cq.completedAt,
      quest: {
        id: q.id,
        title: q.title,
        description: q.description,
        questType: q.questType,
        targetNpcId: q.targetNpcId,
        targetRole: q.targetRole,
        targetCount: q.targetCount,
        rewardXp: q.rewardXp,
        rewardGold: q.rewardGold,
        requiredLevel: q.requiredLevel,
      },
    }))
  );
});

export default router;
