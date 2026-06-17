import { Router } from "express";
import { db } from "@workspace/db";
import {
  charactersTable,
  characterStatsTable,
  insertCharacterSchema,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCharacterParams,
  DeleteCharacterParams,
  GetCharacterStatsParams,
  CreateCharacterBody,
} from "@workspace/api-zod";

const router = Router();

const CLASS_BASE_STATS: Record<string, { attack: number; defense: number; speed: number; critRate: number; maxHp: number }> = {
  "Chiến Binh": { attack: 12, defense: 10, speed: 6, critRate: 8, maxHp: 140 },
  "Pháp Sư":    { attack: 18, defense: 4,  speed: 8, critRate: 12, maxHp: 80  },
  "Thích Khách": { attack: 15, defense: 6,  speed: 14, critRate: 25, maxHp: 90  },
  "Cung Thủ":   { attack: 13, defense: 7,  speed: 11, critRate: 15, maxHp: 100 },
};

router.get("/characters", async (req, res) => {
  const characters = await db.select().from(charactersTable).orderBy(charactersTable.level);
  res.json(characters.reverse());
});

router.post("/characters", async (req, res) => {
  const parsed = CreateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }
  const { name, class: charClass } = parsed.data;
  const baseStats = CLASS_BASE_STATS[charClass] ?? CLASS_BASE_STATS["Chiến Binh"];

  const [character] = await db.insert(charactersTable).values({
    name,
    class: charClass,
    hp: baseStats.maxHp,
    maxHp: baseStats.maxHp,
    xp: 0,
    xpToNext: 150,
    gold: 50,
  }).returning();

  await db.insert(characterStatsTable).values({
    characterId: character.id,
    attack: baseStats.attack,
    defense: baseStats.defense,
    speed: baseStats.speed,
    critRate: baseStats.critRate,
    totalBattles: 0,
    wins: 0,
    losses: 0,
  });

  res.status(201).json(character);
});

router.get("/characters/:id", async (req, res) => {
  const parsed = GetCharacterParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, parsed.data.id));
  if (!character) return res.status(404).json({ error: "Character not found" });
  res.json(character);
});

router.delete("/characters/:id", async (req, res) => {
  const parsed = DeleteCharacterParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(characterStatsTable).where(eq(characterStatsTable.characterId, parsed.data.id));
  await db.delete(charactersTable).where(eq(charactersTable.id, parsed.data.id));
  res.status(204).send();
});

router.get("/characters/:id/stats", async (req, res) => {
  const parsed = GetCharacterStatsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [stats] = await db.select().from(characterStatsTable).where(eq(characterStatsTable.characterId, parsed.data.id));
  if (!stats) return res.status(404).json({ error: "Stats not found" });

  res.json({
    characterId: stats.characterId,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    critRate: stats.critRate,
    totalBattles: stats.totalBattles,
    wins: stats.wins,
    losses: stats.losses,
  });
});

export default router;
