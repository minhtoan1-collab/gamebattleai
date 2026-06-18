import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable, charactersTable, EQUIP_SLOTS } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetInventoryParams, EquipItemParams, EquipItemBody } from "@workspace/api-zod";
import type { EquipSlot } from "@workspace/db";

const router = Router();

router.get("/characters/:id/inventory", async (req, res) => {
  const parsed = GetInventoryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const items = await db
    .select()
    .from(inventoryTable)
    .where(eq(inventoryTable.characterId, parsed.data.id));
  res.json(items);
});

router.post("/characters/:id/equip", async (req, res) => {
  const paramsParsed = EquipItemParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid character id" });

  const bodyParsed = EquipItemBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid item id" });

  const characterId = paramsParsed.data.id;
  const { itemId } = bodyParsed.data;

  const [item] = await db
    .select()
    .from(inventoryTable)
    .where(and(eq(inventoryTable.id, itemId), eq(inventoryTable.characterId, characterId)));
  if (!item) return res.status(404).json({ error: "Item not found" });

  const slot: EquipSlot | null = item.equipSlot ?? deriveSlotFromType(item.type);
  if (!slot) {
    return res.status(400).json({ error: "Item cannot be equipped (no equip slot)" });
  }

  await db
    .update(inventoryTable)
    .set({ isEquipped: false })
    .where(and(eq(inventoryTable.characterId, characterId), eq(inventoryTable.equipSlot, slot)));

  await db
    .update(inventoryTable)
    .set({ isEquipped: true })
    .where(eq(inventoryTable.id, itemId));

  const slotField = slotToCharacterField(slot);
  const [character] = await db
    .update(charactersTable)
    .set({ [slotField]: item.name })
    .where(eq(charactersTable.id, characterId))
    .returning();

  res.json(character);
});

function deriveSlotFromType(type: string): EquipSlot | null {
  if (type === "weapon") return "weapon";
  if (type === "armor") return "armor";
  if (type === "accessory") return "accessory";
  return null;
}

function slotToCharacterField(slot: EquipSlot): "equippedWeapon" | "equippedArmor" | "equippedAccessory" {
  if (slot === "weapon") return "equippedWeapon";
  if (slot === "armor") return "equippedArmor";
  return "equippedAccessory";
}

export default router;
