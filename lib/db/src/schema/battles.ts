import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const battlesTable = pgTable("battles", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  npcId: integer("npc_id").notNull(),
  status: text("status").notNull().default("active"),
  currentTurn: integer("current_turn").notNull().default(1),
  characterHp: integer("character_hp").notNull(),
  npcHp: integer("npc_hp").notNull(),
  xpGained: integer("xp_gained"),
  goldGained: integer("gold_gained"),
  log: text("log").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Battle = typeof battlesTable.$inferSelect;
