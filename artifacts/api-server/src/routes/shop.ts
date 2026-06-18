import { Router } from "express";
import { db } from "@workspace/db";
import {
  shopItemsTable,
  inventoryTable,
  npcsTable,
  charactersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCharacterNpcRelationship } from "../utils/reputation";

const router = Router();

function discountForScore(score: number): number {
  if (score >= 80) return -20;
  if (score >= 50) return -10;
  if (score >= 20) return -5;
  if (score < 0) return 20;
  return 0;
}

function applyDiscount(basePrice: number, discountPct: number): number {
  return Math.max(1, Math.ceil(basePrice * (1 + discountPct / 100)));
}

router.get("/characters/:characterId/shops/:npcId", async (req, res) => {
  const npcId = Number(req.params.npcId);
  const characterId = Number(req.params.characterId);

  if (!Number.isInteger(npcId) || npcId <= 0) {
    return res.status(400).json({ error: "Invalid npcId" });
  }
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid characterId" });
  }

  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, npcId));
  if (!npc) return res.status(404).json({ error: "NPC not found" });
  if (npc.role !== "merchant") return res.status(400).json({ error: "NPC is not a merchant" });

  const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, characterId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  if (npc.locationId !== null && character.currentLocationId !== npc.locationId) {
    return res.status(400).json({ error: "Character is not in the same location as this merchant" });
  }

  const rel = await getCharacterNpcRelationship(characterId, npcId);
  const discount = discountForScore(rel?.score ?? 0);

  const rawItems = await db
    .select()
    .from(shopItemsTable)
    .where(eq(shopItemsTable.npcId, npcId));

  const items = rawItems.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    attackBonus: item.attackBonus,
    defenseBonus: item.defenseBonus,
    basePrice: item.price,
    sellPrice: item.sellPrice,
    finalPrice: applyDiscount(item.price, discount),
    stock: item.stock,
    requiredLevel: item.requiredLevel,
    isAvailable: item.isAvailable,
    canAfford: character.gold >= applyDiscount(item.price, discount),
    meetsLevel: character.level >= item.requiredLevel,
  }));

  res.json({
    npc: { id: npc.id, name: npc.name, locationId: npc.locationId },
    discount,
    items,
  });
});

router.post("/shops/:npcId/buy", async (req, res) => {
  const npcId = Number(req.params.npcId);
  const { characterId, shopItemId } = req.body as Record<string, unknown>;

  if (!Number.isInteger(npcId) || npcId <= 0) {
    return res.status(400).json({ error: "Invalid npcId" });
  }
  const charId = Number(characterId);
  const itemId = Number(shopItemId);
  if (!Number.isInteger(charId) || charId <= 0) {
    return res.status(400).json({ error: "characterId is required and must be a positive integer" });
  }
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ error: "shopItemId is required and must be a positive integer" });
  }

  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, npcId));
  if (!npc) return res.status(404).json({ error: "NPC not found" });
  if (npc.role !== "merchant") return res.status(400).json({ error: "NPC is not a merchant" });

  const [character] = await db.select().from(charactersTable).where(eq(charactersTable.id, charId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  if (npc.locationId !== null && character.currentLocationId !== npc.locationId) {
    return res.status(400).json({ error: "Character is not in the same location as this merchant" });
  }

  const [shopItem] = await db
    .select()
    .from(shopItemsTable)
    .where(and(eq(shopItemsTable.id, itemId), eq(shopItemsTable.npcId, npcId)));
  if (!shopItem) return res.status(404).json({ error: "Item not found in this shop" });
  if (!shopItem.isAvailable) return res.status(400).json({ error: "Item is not available" });
  if (shopItem.stock === 0) return res.status(400).json({ error: "Item is out of stock" });
  if (character.level < shopItem.requiredLevel) {
    return res.status(400).json({
      error: `Yêu cầu cấp ${shopItem.requiredLevel} để mua vật phẩm này. Nhân vật hiện tại cấp ${character.level}.`,
    });
  }

  const rel = await getCharacterNpcRelationship(charId, npcId);
  const discount = discountForScore(rel?.score ?? 0);
  const finalPrice = applyDiscount(shopItem.price, discount);

  if (character.gold < finalPrice) {
    return res.status(400).json({
      error: `Không đủ vàng. Cần ${finalPrice} gold, hiện có ${character.gold} gold.`,
    });
  }

  const [updatedCharacter] = await db
    .update(charactersTable)
    .set({ gold: character.gold - finalPrice })
    .where(eq(charactersTable.id, charId))
    .returning();

  let updatedShopItem = shopItem;
  if (shopItem.stock > 0) {
    const [u] = await db
      .update(shopItemsTable)
      .set({ stock: shopItem.stock - 1 })
      .where(eq(shopItemsTable.id, itemId))
      .returning();
    updatedShopItem = u;
  }

  const [newItem] = await db
    .insert(inventoryTable)
    .values({
      characterId: charId,
      name: shopItem.name,
      type: shopItem.type,
      rarity: shopItem.rarity,
      attackBonus: shopItem.attackBonus,
      defenseBonus: shopItem.defenseBonus,
      isEquipped: false,
      source: "purchase",
    })
    .returning();

  res.json({
    item: newItem,
    character: { id: updatedCharacter.id, gold: updatedCharacter.gold },
    shopItem: { id: updatedShopItem.id, stock: updatedShopItem.stock },
  });
});

export default router;
