import { db } from "../index";
import { skillsTable } from "../schema/skills";

export async function seedSkills() {
  const existing = await db.select().from(skillsTable);
  if (existing.length > 0) {
    console.log(`Skills already seeded (${existing.length} skills). Skipping.`);
    return;
  }

  await db.insert(skillsTable).values([
    {
      name: "Power Strike",
      description: "Một đòn tấn công mạnh mẽ, gây sát thương gấp 1.8 lần chỉ số tấn công hiệu quả.",
      skillType: "attack",
      requiredLevel: 3,
      manaCost: 5,
      cooldownTurns: 2,
      damageMultiplier: "1.80",
      healPercent: 0,
    },
    {
      name: "Shield Bash",
      description: "Dùng khiên đập mạnh vào kẻ thù, gây sát thương 1.4 lần và có cơ hội choáng.",
      skillType: "attack",
      requiredLevel: 5,
      manaCost: 8,
      cooldownTurns: 3,
      damageMultiplier: "1.40",
      healPercent: 0,
    },
    {
      name: "Fireball",
      description: "Phóng quả cầu lửa hủy diệt, gây sát thương gấp 2.2 lần chỉ số tấn công.",
      skillType: "attack",
      requiredLevel: 8,
      manaCost: 15,
      cooldownTurns: 3,
      damageMultiplier: "2.20",
      healPercent: 0,
    },
    {
      name: "Healing Light",
      description: "Triệu hồi ánh sáng chữa lành, hồi phục 25% máu tối đa của nhân vật.",
      skillType: "heal",
      requiredLevel: 10,
      manaCost: 20,
      cooldownTurns: 4,
      damageMultiplier: "1.00",
      healPercent: 25,
    },
    {
      name: "Whirlwind",
      description: "Xoáy vũ bão tàn phá mọi thứ xung quanh, gây sát thương khủng khiếp gấp 3.0 lần.",
      skillType: "attack",
      requiredLevel: 12,
      manaCost: 25,
      cooldownTurns: 5,
      damageMultiplier: "3.00",
      healPercent: 0,
    },
  ]);

  console.log("Seeded 5 skills.");
}

seedSkills()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
