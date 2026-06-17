import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";

export const characterNpcRelationshipsTable = pgTable("character_npc_relationships", {
  id:          serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  npcId:       integer("npc_id").notNull(),
  score:       integer("score").notNull().default(0),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [unique("uq_char_npc_rel").on(t.characterId, t.npcId)]);

export const characterWorldReputationsTable = pgTable("character_world_reputations", {
  id:          serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  worldId:     integer("world_id").notNull(),
  score:       integer("score").notNull().default(0),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [unique("uq_char_world_rep").on(t.characterId, t.worldId)]);

export const relationshipEventsTable = pgTable("relationship_events", {
  id:          serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  npcId:       integer("npc_id"),
  worldId:     integer("world_id"),
  eventType:   text("event_type").notNull(),
  delta:       integer("delta").notNull(),
  sourceType:  text("source_type").notNull(),
  sourceId:    integer("source_id"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type CharacterNpcRelationship = typeof characterNpcRelationshipsTable.$inferSelect;
export type CharacterWorldReputation = typeof characterWorldReputationsTable.$inferSelect;
export type RelationshipEvent = typeof relationshipEventsTable.$inferSelect;
