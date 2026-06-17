import { db } from "@workspace/db";
import { worldsTable, npcsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Bắt đầu seed dữ liệu RPG World...");

  const existingWorlds = await db.select().from(worldsTable);
  if (existingWorlds.length > 0) {
    console.log(`✅ Đã có ${existingWorlds.length} thế giới. Bỏ qua seed.`);
    process.exit(0);
  }

  const worlds = await db
    .insert(worldsTable)
    .values([
      {
        name: "Rừng Nguyên Thủy",
        description: "Khu rừng cổ thụ bí ẩn nơi muôn thú hoang dã sinh sống. Thế giới mở đầu dành cho những chiến binh mới vào nghề.",
        theme: "Nature",
        minLevel: 1,
        npcCount: 4,
        isBossWorld: false,
      },
      {
        name: "Lâu Đài Bóng Tối",
        description: "Tòa thành ma quái bị bóng tối bao phủ ngàn năm. Những sinh vật bất tử và ác quỷ canh giữ từng ngóc ngách.",
        theme: "Dark Fantasy",
        minLevel: 5,
        npcCount: 4,
        isBossWorld: false,
      },
      {
        name: "Hang Động Long Mạch",
        description: "Hang động dưới lòng núi lửa nơi những con rồng cổ đại trú ngụ. Sức nóng thiêu đốt và hiểm nguy rình rập mọi bước chân.",
        theme: "Dragon",
        minLevel: 10,
        npcCount: 4,
        isBossWorld: true,
      },
      {
        name: "Thành Phố Hơi Nước",
        description: "Đô thị cơ giới với những cỗ máy khổng lồ. Robot tuần tra và thợ máy điên kiểm soát từng con đường.",
        theme: "Steampunk",
        minLevel: 15,
        npcCount: 4,
        isBossWorld: false,
      },
      {
        name: "Cõi Linh Giới",
        description: "Cõi trời huyền ảo nơi thần linh và ác ma giao chiến. Thế giới cuối cùng chỉ dành cho những chiến binh huyền thoại.",
        theme: "Mythic",
        minLevel: 20,
        npcCount: 4,
        isBossWorld: true,
      },
    ])
    .returning();

  console.log(`✅ Đã tạo ${worlds.length} thế giới`);

  const [forest, castle, dragon, steam, mythic] = worlds;

  await db.insert(npcsTable).values([
    // ── Rừng Nguyên Thủy ──────────────────────────────────────────
    {
      name: "Sói Hoang Dã",
      type: "Beast",
      level: 1,
      hp: 40,
      maxHp: 40,
      worldId: forest.id,
      difficulty: "Easy",
      xpReward: 30,
      goldReward: 15,
      isBoss: false,
    },
    {
      name: "Gấu Rừng Tinh Anh",
      type: "Beast",
      level: 2,
      hp: 70,
      maxHp: 70,
      worldId: forest.id,
      difficulty: "Normal",
      xpReward: 60,
      goldReward: 30,
      isBoss: false,
    },
    {
      name: "Rắn Khổng Lồ Cường Hóa",
      type: "Beast",
      level: 3,
      hp: 90,
      maxHp: 90,
      worldId: forest.id,
      difficulty: "Hard",
      xpReward: 90,
      goldReward: 45,
      isBoss: false,
    },
    {
      name: "Thần Thú Rừng Xanh",
      type: "Beast",
      level: 4,
      hp: 150,
      maxHp: 150,
      worldId: forest.id,
      difficulty: "Boss",
      xpReward: 150,
      goldReward: 80,
      isBoss: true,
    },

    // ── Lâu Đài Bóng Tối ──────────────────────────────────────────
    {
      name: "Bộ Xương Lính",
      type: "Undead",
      level: 5,
      hp: 80,
      maxHp: 80,
      worldId: castle.id,
      difficulty: "Easy",
      xpReward: 80,
      goldReward: 40,
      isBoss: false,
    },
    {
      name: "Zombie Tinh Anh",
      type: "Undead",
      level: 6,
      hp: 130,
      maxHp: 130,
      worldId: castle.id,
      difficulty: "Normal",
      xpReward: 150,
      goldReward: 75,
      isBoss: false,
    },
    {
      name: "Hắc Kỵ Sĩ Cường Hóa",
      type: "Undead",
      level: 7,
      hp: 170,
      maxHp: 170,
      worldId: castle.id,
      difficulty: "Hard",
      xpReward: 210,
      goldReward: 105,
      isBoss: false,
    },
    {
      name: "Bá Tước Ma Cà Rồng",
      type: "Undead",
      level: 8,
      hp: 300,
      maxHp: 300,
      worldId: castle.id,
      difficulty: "Boss",
      xpReward: 375,
      goldReward: 200,
      isBoss: true,
    },

    // ── Hang Động Long Mạch ────────────────────────────────────────
    {
      name: "Rồng Con Lửa",
      type: "Elemental",
      level: 10,
      hp: 160,
      maxHp: 160,
      worldId: dragon.id,
      difficulty: "Easy",
      xpReward: 180,
      goldReward: 90,
      isBoss: false,
    },
    {
      name: "Rồng Đất Tinh Anh",
      type: "Elemental",
      level: 12,
      hp: 250,
      maxHp: 250,
      worldId: dragon.id,
      difficulty: "Normal",
      xpReward: 360,
      goldReward: 180,
      isBoss: false,
    },
    {
      name: "Chiến Binh Rồng Cường Hóa",
      type: "Human",
      level: 13,
      hp: 320,
      maxHp: 320,
      worldId: dragon.id,
      difficulty: "Hard",
      xpReward: 510,
      goldReward: 255,
      isBoss: false,
    },
    {
      name: "Cổ Long Huyết Mạch",
      type: "Elemental",
      level: 15,
      hp: 600,
      maxHp: 600,
      worldId: dragon.id,
      difficulty: "Boss",
      xpReward: 900,
      goldReward: 450,
      isBoss: true,
    },

    // ── Thành Phố Hơi Nước ────────────────────────────────────────
    {
      name: "Robot Tuần Tra MK-I",
      type: "Mechanical",
      level: 15,
      hp: 280,
      maxHp: 280,
      worldId: steam.id,
      difficulty: "Easy",
      xpReward: 300,
      goldReward: 150,
      isBoss: false,
    },
    {
      name: "Thợ Máy Tinh Anh",
      type: "Human",
      level: 16,
      hp: 400,
      maxHp: 400,
      worldId: steam.id,
      difficulty: "Normal",
      xpReward: 600,
      goldReward: 300,
      isBoss: false,
    },
    {
      name: "Robot Chiến Đấu MK-III Cường Hóa",
      type: "Mechanical",
      level: 17,
      hp: 500,
      maxHp: 500,
      worldId: steam.id,
      difficulty: "Hard",
      xpReward: 900,
      goldReward: 450,
      isBoss: false,
    },
    {
      name: "Hoàng Đế Cơ Khí",
      type: "Mechanical",
      level: 19,
      hp: 900,
      maxHp: 900,
      worldId: steam.id,
      difficulty: "Boss",
      xpReward: 1500,
      goldReward: 750,
      isBoss: true,
    },

    // ── Cõi Linh Giới ─────────────────────────────────────────────
    {
      name: "Thiên Sứ Sa Ngã",
      type: "Divine",
      level: 20,
      hp: 450,
      maxHp: 450,
      worldId: mythic.id,
      difficulty: "Easy",
      xpReward: 500,
      goldReward: 250,
      isBoss: false,
    },
    {
      name: "Ác Thần Tinh Anh",
      type: "Divine",
      level: 22,
      hp: 650,
      maxHp: 650,
      worldId: mythic.id,
      difficulty: "Normal",
      xpReward: 1000,
      goldReward: 500,
      isBoss: false,
    },
    {
      name: "Thần Hộ Vệ Cường Hóa",
      type: "Divine",
      level: 23,
      hp: 850,
      maxHp: 850,
      worldId: mythic.id,
      difficulty: "Hard",
      xpReward: 1500,
      goldReward: 750,
      isBoss: false,
    },
    {
      name: "Thần Vương Hắc Ám",
      type: "Divine",
      level: 25,
      hp: 1500,
      maxHp: 1500,
      worldId: mythic.id,
      difficulty: "Boss",
      xpReward: 2500,
      goldReward: 1200,
      isBoss: true,
    },
  ]);

  console.log("✅ Đã tạo 20 NPC (4 mỗi thế giới)");
  console.log("🎮 Seed hoàn tất! RPG World sẵn sàng chiến đấu.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Lỗi seed:", err);
  process.exit(1);
});
