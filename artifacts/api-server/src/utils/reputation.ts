import { db } from "@workspace/db";
import {
  characterNpcRelationshipsTable,
  characterWorldReputationsTable,
  relationshipEventsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

export function scoreTier(score: number): string {
  if (score >= 80) return "Anh Hùng";
  if (score >= 50) return "Kính Trọng";
  if (score >= 20) return "Thiện Cảm";
  if (score >= -19) return "Trung Lập";
  if (score >= -49) return "Ngờ Vực";
  if (score >= -79) return "Thù Địch";
  return "Tử Thù";
}

function clamp(v: number): number {
  return Math.max(-100, Math.min(100, v));
}

export async function adjustNpcRelationship(
  characterId: number,
  npcId: number,
  delta: number,
  eventType: string,
  sourceType: string,
  sourceId: number | null = null
): Promise<void> {
  await db
    .insert(characterNpcRelationshipsTable)
    .values({ characterId, npcId, score: clamp(delta), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [characterNpcRelationshipsTable.characterId, characterNpcRelationshipsTable.npcId],
      set: {
        score: sql`LEAST(100, GREATEST(-100, ${characterNpcRelationshipsTable.score} + ${delta}))`,
        updatedAt: sql`now()`,
      },
    });

  await db.insert(relationshipEventsTable).values({
    characterId,
    npcId,
    worldId: null,
    eventType,
    delta,
    sourceType,
    sourceId,
  });
}

export async function adjustWorldReputation(
  characterId: number,
  worldId: number,
  delta: number,
  eventType: string,
  sourceType: string,
  sourceId: number | null = null
): Promise<void> {
  await db
    .insert(characterWorldReputationsTable)
    .values({ characterId, worldId, score: clamp(delta), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [characterWorldReputationsTable.characterId, characterWorldReputationsTable.worldId],
      set: {
        score: sql`LEAST(100, GREATEST(-100, ${characterWorldReputationsTable.score} + ${delta}))`,
        updatedAt: sql`now()`,
      },
    });

  await db.insert(relationshipEventsTable).values({
    characterId,
    npcId: null,
    worldId,
    eventType,
    delta,
    sourceType,
    sourceId,
  });
}
