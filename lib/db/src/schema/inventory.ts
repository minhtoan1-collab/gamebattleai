import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";

export const ITEM_TYPES = ["weapon", "armor", "consumable", "accessory", "material"] as const;
export type ItemType = typeof ITEM_TYPES[number];

export const ITEM_RARITIES = ["Thường", "Hiếm", "Sử Thi", "Huyền Thoại"] as const;
export type ItemRarity = typeof ITEM_RARITIES[number];

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  type: text("type").$type<ItemType>().notNull(),
  rarity: text("rarity").$type<ItemRarity>().notNull().default("Thường"),
  attackBonus: integer("attack_bonus").notNull().default(0),
  defenseBonus: integer("defense_bonus").notNull().default(0),
  isEquipped: boolean("is_equipped").notNull().default(false),
  source: text("source").notNull().default("drop"),
});

export type InventoryItem = typeof inventoryTable.$inferSelect;
