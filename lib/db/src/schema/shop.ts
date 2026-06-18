import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";
import type { ItemType, ItemRarity } from "./inventory";

export const shopItemsTable = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  npcId: integer("npc_id").notNull(),
  name: text("name").notNull(),
  type: text("type").$type<ItemType>().notNull(),
  rarity: text("rarity").$type<ItemRarity>().notNull().default("Thường"),
  attackBonus: integer("attack_bonus").notNull().default(0),
  defenseBonus: integer("defense_bonus").notNull().default(0),
  price: integer("price").notNull(),
  sellPrice: integer("sell_price").notNull(),
  stock: integer("stock").notNull().default(-1),
  requiredLevel: integer("required_level").notNull().default(1),
  isAvailable: boolean("is_available").notNull().default(true),
});

export type ShopItem = typeof shopItemsTable.$inferSelect;
