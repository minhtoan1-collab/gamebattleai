import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, characterStatsTable, battlesTable, worldsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/progression/leaderboard", async (_req, res) => {
  const characters = await db
    .select()
    .from(charactersTable)
    .orderBy(desc(charactersTable.level));

  const entries = await Promise.all(
    characters.map(async (c, index) => {
      const [stats] = await db
        .select()
        .from(characterStatsTable)
        .where(eq(characterStatsTable.characterId, c.id));
      return {
        rank: index + 1,
        characterId: c.id,
        name: c.name,
        class: c.class,
        level: c.level,
        totalBattles: stats?.totalBattles ?? 0,
        wins: stats?.wins ?? 0,
      };
    })
  );

  res.json(entries);
});

router.get("/progression/summary", async (_req, res) => {
  const characters = await db.select().from(charactersTable);
  const battles = await db.select().from(battlesTable);
  const worlds = await db.select().from(worldsTable);

  const totalCharacters = characters.length;
  const totalBattles = battles.length;
  const totalNpcsDefeated = battles.filter((b) => b.status === "won").length;

  const classCounts: Record<string, number> = {};
  for (const c of characters) {
    classCounts[c.class] = (classCounts[c.class] ?? 0) + 1;
  }
  const topClass =
    Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Chiến Binh";

  const worldsExplored = worlds.length;

  res.json({
    totalCharacters,
    totalBattles,
    totalNpcsDefeated,
    topClass,
    worldsExplored,
  });
});

export default router;
