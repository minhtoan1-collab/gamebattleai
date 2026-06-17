import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  rarity: text("rarity").notNull().default("Thường"),
  attackBonus: integer("attack_bonus").notNull().default(0),
  defenseBonus: integer("defense_bonus").notNull().default(0),
  isEquipped: boolean("is_equipped").notNull().default(false),
});

export type InventoryItem = typeof inventoryTable.$inferSelect;
