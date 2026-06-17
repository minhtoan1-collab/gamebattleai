import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const QUEST_TYPES = ["kill_npc", "kill_role"] as const;
export type QuestType = typeof QUEST_TYPES[number];

export const QUEST_STATUSES = ["active", "completed", "claimed"] as const;
export type QuestStatus = typeof QUEST_STATUSES[number];

export const questsTable = pgTable("quests", {
  id:             serial("id").primaryKey(),
  title:          text("title").notNull(),
  description:    text("description").notNull(),
  questType:      text("quest_type").$type<QuestType>().notNull(),
  questGiverId:   integer("quest_giver_id"),
  targetNpcId:    integer("target_npc_id"),
  targetRole:     text("target_role"),
  targetCount:    integer("target_count").notNull().default(1),
  requiredLevel:  integer("required_level").notNull().default(1),
  rewardXp:       integer("reward_xp").notNull(),
  rewardGold:     integer("reward_gold").notNull(),
  rewardItemId:   integer("reward_item_id"),
});

export const characterQuestsTable = pgTable("character_quests", {
  id:          serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  questId:     integer("quest_id").notNull(),
  status:      text("status").$type<QuestStatus>().notNull().default("active"),
  progress:    integer("progress").notNull().default(0),
  completedAt: timestamp("completed_at"),
}, (t) => [unique("uq_character_quest").on(t.characterId, t.questId)]);

export type Quest = typeof questsTable.$inferSelect;
export type InsertQuest = typeof questsTable.$inferInsert;
export type CharacterQuest = typeof characterQuestsTable.$inferSelect;
export type InsertCharacterQuest = typeof characterQuestsTable.$inferInsert;
