import { db } from "@workspace/db";
import { characterQuestsTable, questsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export async function advanceQuestProgress(
  characterId: number,
  defeatedNpcId: number,
  defeatedNpcRole: string
): Promise<void> {
  const activeQuests = await db
    .select({ cq: characterQuestsTable, q: questsTable })
    .from(characterQuestsTable)
    .innerJoin(questsTable, eq(characterQuestsTable.questId, questsTable.id))
    .where(
      and(
        eq(characterQuestsTable.characterId, characterId),
        eq(characterQuestsTable.status, "active")
      )
    );

  for (const { cq, q } of activeQuests) {
    let matches = false;

    if (q.questType === "kill_npc" && q.targetNpcId === defeatedNpcId) {
      matches = true;
    } else if (q.questType === "kill_role" && q.targetRole === defeatedNpcRole) {
      matches = true;
    }

    if (!matches) continue;

    const newProgress = cq.progress + 1;
    const isComplete = newProgress >= q.targetCount;

    await db
      .update(characterQuestsTable)
      .set({
        progress: newProgress,
        status: isComplete ? "completed" : "active",
        completedAt: isComplete ? new Date() : null,
      })
      .where(eq(characterQuestsTable.id, cq.id));
  }
}
