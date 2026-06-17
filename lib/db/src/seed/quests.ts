import { db } from "../index";
import { questsTable } from "../schema/quests";

export async function seedQuests() {
  const existing = await db.select().from(questsTable);
  if (existing.length > 0) {
    console.log(`Quests already seeded (${existing.length} quests). Skipping.`);
    return;
  }

  await db.insert(questsTable).values([
    // ── Người Dẫn Đường (NPC 10, loc 3 — Rừng Thâm Sâu) ──
    {
      title: "Diệt Linh Thú Rừng",
      description: "Linh Thú Rừng đang tàn phá các ngôi làng ven rừng. Hãy tiêu diệt nó để bảo vệ dân lành.",
      questType: "kill_npc",
      questGiverId: 10,
      targetNpcId: 8,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 1,
      rewardXp: 80,
      rewardGold: 40,
      rewardItemId: null,
    },
    {
      title: "Truy Đuổi Vua Rừng",
      description: "Vua Rừng — kẻ thống trị cánh rừng tối tăm — phải bị tiêu diệt. Chỉ người thực sự mạnh mẽ mới dám thách thức hắn.",
      questType: "kill_npc",
      questGiverId: 10,
      targetNpcId: 11,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 3,
      rewardXp: 300,
      rewardGold: 120,
      rewardItemId: null,
    },
    // ── Nhà Nghiên Cứu (NPC 21, loc 6 — Núi Lửa Hắc Ám) ──
    {
      title: "Mẫu Vật Quỷ Lửa",
      description: "Ta cần nghiên cứu về các sinh vật lửa trong vùng. Hãy tiêu diệt 3 kẻ thù tại đây để ta thu thập dữ liệu.",
      questType: "kill_role",
      questGiverId: 21,
      targetNpcId: null,
      targetRole: "enemy",
      targetCount: 3,
      requiredLevel: 4,
      rewardXp: 180,
      rewardGold: 90,
      rewardItemId: null,
    },
    {
      title: "Hạ Gục Chúa Quỷ Lửa",
      description: "Chúa Quỷ Lửa là nguồn gốc của mọi thảm họa núi lửa. Chỉ khi hắn bị hạ gục, vùng đất này mới được bình yên.",
      questType: "kill_npc",
      questGiverId: 21,
      targetNpcId: 22,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 6,
      rewardXp: 400,
      rewardGold: 150,
      rewardItemId: null,
    },
    // ── Tù Nhân Sống Sót (NPC 28, loc 8 — Ngục Tối Địa Ngục) ──
    {
      title: "Trả Thù Bóng Ma Tra Tấn",
      description: "Bóng Ma Tra Tấn đã giam cầm ta nhiều năm. Hãy giết nó và trả thù cho tất cả tù nhân bất hạnh.",
      questType: "kill_npc",
      questGiverId: 28,
      targetNpcId: 26,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 6,
      rewardXp: 150,
      rewardGold: 70,
      rewardItemId: null,
    },
    {
      title: "Dọn Sạch Hầm Ngục",
      description: "Hầm ngục đầy rẫy quái vật. Ta cần ngươi tiêu diệt ít nhất 5 kẻ thù để mở đường tẩu thoát.",
      questType: "kill_role",
      questGiverId: 28,
      targetNpcId: null,
      targetRole: "enemy",
      targetCount: 5,
      requiredLevel: 7,
      rewardXp: 250,
      rewardGold: 100,
      rewardItemId: null,
    },
    // ── Thủy Thủ Sống Sót (NPC 35, loc 10 — Vùng Biển Ma) ──
    {
      title: "Trừng Trị Hải Tặc Ma",
      description: "Bọn Hải Tặc Ma đã cướp tàu ta và giết đồng đội. Hãy tiêu diệt tên đầu sỏ để ta được yên nghỉ.",
      questType: "kill_npc",
      questGiverId: 35,
      targetNpcId: 33,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 8,
      rewardXp: 200,
      rewardGold: 80,
      rewardItemId: null,
    },
    {
      title: "Chặt Đầu Thuyền Trưởng Hắc Ám",
      description: "Thuyền Trưởng Hắc Ám kiểm soát toàn bộ hạm đội ma. Tiêu diệt hắn — đội quân ma sẽ tan rã.",
      questType: "kill_npc",
      questGiverId: 35,
      targetNpcId: 36,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 9,
      rewardXp: 220,
      rewardGold: 90,
      rewardItemId: null,
    },
    // ── Người Giữ Đảo (NPC 43, loc 12 — Đảo Ngục Tù) ──
    {
      title: "Thách Thức Hải Vương",
      description: "Hải Vương cai trị vùng biển sâu và không cho ai thoát ra. Hắn là kẻ duy nhất đứng giữa ngươi và tự do.",
      questType: "kill_npc",
      questGiverId: 43,
      targetNpcId: 44,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 12,
      rewardXp: 500,
      rewardGold: 200,
      rewardItemId: null,
    },
    // ── Hồn Ma Học Giả (NPC 52, loc 14 — Vùng Hư Không) ──
    {
      title: "Tiêu Diệt Chúa Tể Bóng Tối",
      description: "Chúa Tể Bóng Tối là thứ sức mạnh tối thượng muốn nuốt chửng thế giới này. Đây là trận chiến cuối cùng — ngươi có đủ can đảm không?",
      questType: "kill_npc",
      questGiverId: 52,
      targetNpcId: 56,
      targetRole: null,
      targetCount: 1,
      requiredLevel: 18,
      rewardXp: 800,
      rewardGold: 300,
      rewardItemId: null,
    },
  ]);

  console.log("Seeded 10 quests.");
}
