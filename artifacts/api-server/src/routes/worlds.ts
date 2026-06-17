import { Router } from "express";
import { db } from "@workspace/db";
import { worldsTable, npcsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetWorldParams, ListWorldNpcsParams } from "@workspace/api-zod";

const router = Router();

router.get("/worlds", async (_req, res) => {
  const worlds = await db.select().from(worldsTable).orderBy(worldsTable.minLevel);
  res.json(worlds);
});

router.get("/worlds/:id", async (req, res) => {
  const parsed = GetWorldParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [world] = await db.select().from(worldsTable).where(eq(worldsTable.id, parsed.data.id));
  if (!world) return res.status(404).json({ error: "World not found" });
  res.json(world);
});

router.get("/worlds/:id/npcs", async (req, res) => {
  const parsed = ListWorldNpcsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const npcs = await db.select().from(npcsTable).where(eq(npcsTable.worldId, parsed.data.id));
  res.json(npcs);
});

export default router;
