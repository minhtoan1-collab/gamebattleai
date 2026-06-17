import { Router } from "express";
import { db } from "@workspace/db";
import { locationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/locations/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [location] = await db
    .select()
    .from(locationsTable)
    .where(eq(locationsTable.id, id));

  if (!location) return res.status(404).json({ error: "Location not found" });
  res.json(location);
});

export default router;
