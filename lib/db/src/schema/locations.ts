import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  dangerLevel: integer("danger_level").notNull().default(1),
});

export type Location = typeof locationsTable.$inferSelect;
export type InsertLocation = typeof locationsTable.$inferInsert;
