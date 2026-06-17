import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const NPC_ROLES = ["enemy", "merchant", "guard", "quest_giver", "boss"] as const;
export type NpcRole = typeof NPC_ROLES[number];

export const npcsTable = pgTable("npcs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  level: integer("level").notNull().default(1),
  hp: integer("hp").notNull().default(50),
  maxHp: integer("max_hp").notNull().default(50),
  worldId: integer("world_id").notNull(),
  locationId: integer("location_id"),
  difficulty: text("difficulty").notNull().default("Easy"),
  xpReward: integer("xp_reward").notNull().default(30),
  goldReward: integer("gold_reward").notNull().default(15),
  isBoss: boolean("is_boss").notNull().default(false),
  role: text("role").$type<NpcRole>().notNull().default("enemy"),
  description: text("description").notNull().default(""),
  isInteractable: boolean("is_interactable").notNull().default(true),
});

export type Npc = typeof npcsTable.$inferSelect;
