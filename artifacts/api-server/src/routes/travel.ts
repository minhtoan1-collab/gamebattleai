import { Router } from "express";
import { db } from "@workspace/db";
import {
  charactersTable,
  worldsTable,
  locationsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.post("/travel", async (req, res) => {
  const { characterId, worldId, locationId } = req.body as {
    characterId: unknown;
    worldId: unknown;
    locationId: unknown;
  };

  const charId = Number(characterId);
  const wldId = Number(worldId);

  if (!Number.isInteger(charId) || charId <= 0) {
    return res.status(400).json({ error: "characterId must be a positive integer" });
  }
  if (!Number.isInteger(wldId) || wldId <= 0) {
    return res.status(400).json({ error: "worldId must be a positive integer" });
  }

  const locId =
    locationId !== undefined && locationId !== null
      ? Number(locationId)
      : undefined;

  if (locId !== undefined && (!Number.isInteger(locId) || locId <= 0)) {
    return res.status(400).json({ error: "locationId must be a positive integer" });
  }

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, charId));

  if (!character) return res.status(404).json({ error: "Character not found" });

  const [world] = await db
    .select()
    .from(worldsTable)
    .where(eq(worldsTable.id, wldId));

  if (!world) return res.status(404).json({ error: "World not found" });

  if (character.level < world.minLevel) {
    return res.status(403).json({
      error: `Level too low. Requires level ${world.minLevel}, character is level ${character.level}.`,
    });
  }

  let resolvedLocationId: number | null = null;

  if (locId !== undefined) {
    const [location] = await db
      .select()
      .from(locationsTable)
      .where(and(eq(locationsTable.id, locId), eq(locationsTable.worldId, wldId)));

    if (!location) {
      return res.status(404).json({
        error: "Location not found or does not belong to this world",
      });
    }
    resolvedLocationId = location.id;
  } else {
    const [firstLocation] = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.worldId, wldId))
      .orderBy(locationsTable.dangerLevel)
      .limit(1);

    if (firstLocation) resolvedLocationId = firstLocation.id;
  }

  const [updated] = await db
    .update(charactersTable)
    .set({ worldId: wldId, currentLocationId: resolvedLocationId })
    .where(eq(charactersTable.id, charId))
    .returning();

  const locationData = resolvedLocationId
    ? await db
        .select()
        .from(locationsTable)
        .where(eq(locationsTable.id, resolvedLocationId))
        .then((r) => r[0] ?? null)
    : null;

  res.json({ character: updated, world, location: locationData });
});

export default router;
