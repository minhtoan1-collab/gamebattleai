import { Router } from "express";
import { db } from "@workspace/db";
import { npcsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetNpcParams } from "@workspace/api-zod";

const router = Router();

router.get("/npcs", async (_req, res) => {
  const npcs = await db.select().from(npcsTable).orderBy(npcsTable.level);
  res.json(npcs);
});

router.get("/npcs/:id", async (req, res) => {
  const parsed = GetNpcParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, parsed.data.id));
  if (!npc) return res.status(404).json({ error: "NPC not found" });
  res.json(npc);
});

export default router;
