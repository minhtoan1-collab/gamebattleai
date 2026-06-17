import { Router } from "express";
import { db } from "@workspace/db";
import {
  characterNpcRelationshipsTable,
  characterWorldReputationsTable,
  npcsTable,
  worldsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { scoreTier } from "../utils/reputation";

const router = Router();

router.get("/characters/:id/reputation", async (req, res) => {
  const characterId = Number(req.params.id);
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }

  const rows = await db
    .select({ rep: characterWorldReputationsTable, world: worldsTable })
    .from(characterWorldReputationsTable)
    .innerJoin(worldsTable, eq(characterWorldReputationsTable.worldId, worldsTable.id))
    .where(eq(characterWorldReputationsTable.characterId, characterId));

  res.json(
    rows.map(({ rep, world }) => ({
      worldId: rep.worldId,
      worldName: world.name,
      score: rep.score,
      tier: scoreTier(rep.score),
      updatedAt: rep.updatedAt,
    }))
  );
});

router.get("/characters/:id/relationships", async (req, res) => {
  const characterId = Number(req.params.id);
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }

  const rows = await db
    .select({ rel: characterNpcRelationshipsTable, npc: npcsTable })
    .from(characterNpcRelationshipsTable)
    .innerJoin(npcsTable, eq(characterNpcRelationshipsTable.npcId, npcsTable.id))
    .where(eq(characterNpcRelationshipsTable.characterId, characterId));

  res.json(
    rows.map(({ rel, npc }) => ({
      npcId: rel.npcId,
      npcName: npc.name,
      npcRole: npc.role,
      score: rel.score,
      tier: scoreTier(rel.score),
      updatedAt: rel.updatedAt,
    }))
  );
});

router.get("/characters/:id/relationships/:npcId", async (req, res) => {
  const characterId = Number(req.params.id);
  const npcId = Number(req.params.npcId);

  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }
  if (!Number.isInteger(npcId) || npcId <= 0) {
    return res.status(400).json({ error: "Invalid npc id" });
  }

  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, npcId));
  if (!npc) return res.status(404).json({ error: "NPC not found" });

  const [rel] = await db
    .select()
    .from(characterNpcRelationshipsTable)
    .where(
      and(
        eq(characterNpcRelationshipsTable.characterId, characterId),
        eq(characterNpcRelationshipsTable.npcId, npcId)
      )
    );

  const score = rel?.score ?? 0;
  res.json({
    npcId,
    npcName: npc.name,
    npcRole: npc.role,
    score,
    tier: scoreTier(score),
    updatedAt: rel?.updatedAt ?? null,
  });
});

export default router;
