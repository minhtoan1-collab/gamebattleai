import { db } from "@workspace/db";
import { skillsTable, characterSkillsTable } from "@workspace/db";
import { and, eq, lte } from "drizzle-orm";

export async function unlockAvailableSkills(characterId: number, level: number): Promise<void> {
  const eligibleSkills = await db
    .select({ id: skillsTable.id })
    .from(skillsTable)
    .where(and(eq(skillsTable.isActive, true), lte(skillsTable.requiredLevel, level)));

  if (eligibleSkills.length === 0) return;

  await db
    .insert(characterSkillsTable)
    .values(eligibleSkills.map((s) => ({ characterId, skillId: s.id })))
    .onConflictDoNothing();
}
