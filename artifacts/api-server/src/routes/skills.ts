import { Router } from "express";
import { db } from "@workspace/db";
import { skillsTable, characterSkillsTable, charactersTable } from "@workspace/db";
import { and, eq, lte } from "drizzle-orm";

const router = Router();

router.get("/skills", async (_req, res) => {
  const skills = await db
    .select()
    .from(skillsTable)
    .where(eq(skillsTable.isActive, true));
  res.json(skills);
});

router.get("/characters/:id/skills", async (req, res) => {
  const characterId = Number(req.params.id);
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }

  const rows = await db
    .select({
      id: skillsTable.id,
      name: skillsTable.name,
      description: skillsTable.description,
      skillType: skillsTable.skillType,
      requiredLevel: skillsTable.requiredLevel,
      manaCost: skillsTable.manaCost,
      cooldownTurns: skillsTable.cooldownTurns,
      damageMultiplier: skillsTable.damageMultiplier,
      healPercent: skillsTable.healPercent,
      unlockedAt: characterSkillsTable.unlockedAt,
    })
    .from(characterSkillsTable)
    .innerJoin(skillsTable, eq(characterSkillsTable.skillId, skillsTable.id))
    .where(eq(characterSkillsTable.characterId, characterId));

  res.json(rows);
});

router.post("/characters/:id/skills/:skillId/unlock", async (req, res) => {
  const characterId = Number(req.params.id);
  const skillId = Number(req.params.skillId);

  if (!Number.isInteger(characterId) || characterId <= 0) {
    return res.status(400).json({ error: "Invalid character id" });
  }
  if (!Number.isInteger(skillId) || skillId <= 0) {
    return res.status(400).json({ error: "Invalid skill id" });
  }

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, characterId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  const [skill] = await db
    .select()
    .from(skillsTable)
    .where(and(eq(skillsTable.id, skillId), eq(skillsTable.isActive, true)));
  if (!skill) return res.status(404).json({ error: "Skill not found" });

  if (character.level < skill.requiredLevel) {
    return res.status(403).json({
      error: `Yêu cầu cấp ${skill.requiredLevel} để mở khóa kỹ năng này. Nhân vật hiện tại cấp ${character.level}.`,
    });
  }

  const [existing] = await db
    .select()
    .from(characterSkillsTable)
    .where(
      and(
        eq(characterSkillsTable.characterId, characterId),
        eq(characterSkillsTable.skillId, skillId),
      ),
    );
  if (existing) {
    return res.status(409).json({ error: "Skill already unlocked." });
  }

  const [row] = await db
    .insert(characterSkillsTable)
    .values({ characterId, skillId })
    .returning();

  res.status(201).json({ characterSkill: row, skill });
});

export default router;
