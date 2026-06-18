import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  unique,
} from "drizzle-orm/pg-core";

export const SKILL_TYPES = ["attack", "heal", "buff", "debuff", "utility"] as const;
export type SkillType = typeof SKILL_TYPES[number];

export const skillsTable = pgTable("skills", {
  id:               serial("id").primaryKey(),
  name:             text("name").notNull(),
  description:      text("description").notNull(),
  skillType:        text("skill_type").$type<SkillType>().notNull(),
  requiredLevel:    integer("required_level").notNull().default(1),
  manaCost:         integer("mana_cost").notNull().default(0),
  cooldownTurns:    integer("cooldown_turns").notNull().default(0),
  damageMultiplier: numeric("damage_multiplier", { precision: 4, scale: 2 }).notNull().default("1.00"),
  healPercent:      integer("heal_percent").notNull().default(0),
  isActive:         boolean("is_active").notNull().default(true),
});

export const characterSkillsTable = pgTable("character_skills", {
  id:          serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  skillId:     integer("skill_id").notNull(),
  unlockedAt:  timestamp("unlocked_at").notNull().defaultNow(),
}, (t) => [unique("uq_character_skill").on(t.characterId, t.skillId)]);

export const battleSkillCooldownsTable = pgTable("battle_skill_cooldowns", {
  id:             serial("id").primaryKey(),
  battleId:       integer("battle_id").notNull(),
  characterId:    integer("character_id").notNull(),
  skillId:        integer("skill_id").notNull(),
  remainingTurns: integer("remaining_turns").notNull().default(0),
}, (t) => [unique("uq_battle_skill_cooldown").on(t.battleId, t.characterId, t.skillId)]);

export type Skill = typeof skillsTable.$inferSelect;
export type CharacterSkill = typeof characterSkillsTable.$inferSelect;
export type BattleSkillCooldown = typeof battleSkillCooldownsTable.$inferSelect;
