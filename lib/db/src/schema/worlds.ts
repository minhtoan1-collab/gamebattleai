import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const worldsTable = pgTable("worlds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(),
  minLevel: integer("min_level").notNull().default(1),
  npcCount: integer("npc_count").notNull().default(0),
  isBossWorld: boolean("is_boss_world").notNull().default(false),
});

export type World = typeof worldsTable.$inferSelect;
