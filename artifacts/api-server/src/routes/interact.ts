import { Router } from "express";
import { db } from "@workspace/db";
import {
  npcsTable,
  charactersTable,
  npcInteractionsTable,
  questsTable,
  INTERACTION_TYPES,
  type InteractionType,
  type NpcRole,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { adjustNpcRelationship } from "../utils/reputation";

const router = Router();

const ROLE_ACTIONS: Record<NpcRole, InteractionType[]> = {
  merchant:    ["talk", "trade", "inspect"],
  quest_giver: ["talk", "quest", "inspect"],
  guard:       ["talk", "inspect"],
  enemy:       [],
  boss:        [],
};

const MESSAGES: Record<NpcRole, Partial<Record<InteractionType, string[]>>> = {
  merchant: {
    talk: [
      "Xin chào, lữ khách! Hàng của ta còn nhiều lắm, hãy ghé xem!",
      "Chào mừng đến với gian hàng nhỏ của ta. Ngươi cần gì?",
      "Ồ, một khách hàng! Ta đang cần người mua đồ để có thể thoát khỏi nơi này.",
    ],
    trade: [
      "Xem qua hàng của ta đi, toàn đồ hiếm và giá hợp lý!",
      "Ta có vũ khí, giáp trụ và đủ thứ. Ngươi cần gì cứ hỏi!",
      "Hàng tốt, giá phải chăng. Đảm bảo ngươi sẽ hài lòng!",
    ],
    inspect: [
      "Một thương nhân mệt mỏi với hành lý nặng trĩu, ánh mắt lo lắng nhưng vẫn tỏ ra thân thiện.",
      "Người đàn ông trung tuổi mang theo ba lô đầy ắp hàng hóa, mồ hôi ướt đẫm vì hành trình dài.",
      "Khuôn mặt thông minh và lanh lợi, đôi tay chai sần của người buôn bán lâu năm.",
    ],
  },
  quest_giver: {
    talk: [
      "Ta đang chờ một người dũng cảm như ngươi từ lâu lắm rồi...",
      "Cảm ơn trời đất! Cuối cùng cũng có người nghe ta. Ngươi có thể giúp ta không?",
      "Ngươi trông có vẻ mạnh mẽ. Ta có việc cần người như ngươi.",
    ],
    quest: [
      "Ta có một nhiệm vụ nguy hiểm, nhưng phần thưởng rất xứng đáng. Ngươi có dám không?",
      "Có một bí mật ta cần ngươi khám phá. Đây không phải việc dành cho kẻ yếu bóng vía.",
      "Nhiệm vụ này đã khiến nhiều người bỏ mạng. Nhưng ta tin ngươi có thể làm được.",
    ],
    inspect: [
      "Ánh mắt đầy khắc khoải, như thể đang chờ đợi ai đó từ rất lâu rồi.",
      "Bộ quần áo cũ kỹ và đôi tay run rẩy cho thấy người này đã trải qua nhiều gian khổ.",
      "Vẻ mặt khẩn cầu nhưng kiên định, rõ ràng có điều gì đó quan trọng cần truyền đạt.",
    ],
  },
  guard: {
    talk: [
      "Dừng lại! Khai danh tánh và mục đích của ngươi!",
      "Ta đang làm nhiệm vụ. Ngươi có việc gì không?",
      "Khu vực này được bảo vệ. Ngươi tốt hơn nên giải thích lý do xuất hiện ở đây.",
    ],
    inspect: [
      "Đứng thẳng, giáo dựng, đôi mắt quét khắp tứ phía không ngừng.",
      "Bộ giáp trụ đầy đủ và vũ khí sẵn sàng, đây là người lính canh dày dạn kinh nghiệm.",
      "Vẻ mặt cứng rắn và không khoan nhượng, rõ ràng không phải người dễ thương lượng.",
    ],
  },
  enemy: {},
  boss:  {},
};

function pickMessage(pool: string[], npcId: number): string {
  return pool[npcId % pool.length];
}

router.post("/interact", async (req, res) => {
  const { characterId, npcId, action } = req.body as {
    characterId: unknown;
    npcId: unknown;
    action: unknown;
  };

  if (!INTERACTION_TYPES.includes(action as InteractionType)) {
    return res.status(400).json({
      error: `Invalid action. Must be one of: ${INTERACTION_TYPES.join(", ")}.`,
    });
  }

  const charId = Number(characterId);
  const nId = Number(npcId);

  if (!Number.isInteger(charId) || charId <= 0) {
    return res.status(400).json({ error: "characterId must be a positive integer" });
  }
  if (!Number.isInteger(nId) || nId <= 0) {
    return res.status(400).json({ error: "npcId must be a positive integer" });
  }

  const typedAction = action as InteractionType;

  const [npc] = await db.select().from(npcsTable).where(eq(npcsTable.id, nId));
  if (!npc) return res.status(404).json({ error: "NPC not found" });

  if (!npc.isInteractable) {
    return res.status(403).json({ error: "This NPC cannot be interacted with." });
  }

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, charId));
  if (!character) return res.status(404).json({ error: "Character not found" });

  if (character.currentLocationId !== npc.locationId) {
    return res.status(403).json({
      error: "Character is not in the same location as this NPC.",
    });
  }

  const role = npc.role as NpcRole;
  const allowedActions = ROLE_ACTIONS[role] ?? [];

  if (!allowedActions.includes(typedAction)) {
    return res.status(403).json({
      error: `Action '${typedAction}' is not available for a ${role}.`,
    });
  }

  const messagePool = MESSAGES[role]?.[typedAction] ?? ["..."];
  const message = pickMessage(messagePool, nId);

  const [insertedInteraction] = await db
    .insert(npcInteractionsTable)
    .values({ characterId: charId, npcId: nId, interactionType: typedAction, metadata: null })
    .returning();

  const ACTION_DELTAS: Record<InteractionType, number> = { talk: 2, trade: 3, quest: 5, inspect: 1 };
  await adjustNpcRelationship(
    charId,
    nId,
    ACTION_DELTAS[typedAction],
    `interact_${typedAction}`,
    "interact",
    insertedInteraction.id
  );

  const responseBody: Record<string, unknown> = {
    npc: { id: npc.id, name: npc.name, role: npc.role },
    interaction: { action: typedAction, message },
    availableActions: allowedActions,
  };

  if (typedAction === "quest") {
    const availableQuests = await db
      .select()
      .from(questsTable)
      .where(eq(questsTable.questGiverId, nId));
    responseBody.availableQuests = availableQuests;
  }

  res.json(responseBody);
});

export default router;
