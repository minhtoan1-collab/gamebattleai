import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charactersTable = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull().default(1),
  hp: integer("hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  xp: integer("xp").notNull().default(0),
  xpToNext: integer("xp_to_next").notNull().default(150),
  gold: integer("gold").notNull().default(0),
  worldId: integer("world_id"),
  currentLocationId: integer("current_location_id"),
  equippedWeapon: text("equipped_weapon"),
  equippedArmor: text("equipped_armor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const characterStatsTable = pgTable("character_stats", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  speed: integer("speed").notNull().default(8),
  critRate: integer("crit_rate").notNull().default(10),
  totalBattles: integer("total_battles").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1),
  class: z.string().min(1),
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
export type CharacterStats = typeof characterStatsTable.$inferSelect;
