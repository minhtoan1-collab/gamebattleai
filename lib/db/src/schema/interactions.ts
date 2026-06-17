import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const INTERACTION_TYPES = ["talk", "trade", "quest", "inspect"] as const;
export type InteractionType = typeof INTERACTION_TYPES[number];

export const npcInteractionsTable = pgTable("npc_interactions", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  npcId: integer("npc_id").notNull(),
  interactionType: text("interaction_type").$type<InteractionType>().notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type NpcInteraction = typeof npcInteractionsTable.$inferSelect;
export type InsertNpcInteraction = typeof npcInteractionsTable.$inferInsert;
