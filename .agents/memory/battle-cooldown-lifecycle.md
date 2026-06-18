---
name: Battle cooldown lifecycle
description: How battle_skill_cooldowns rows are managed — tick, upsert, cleanup
---

# Battle cooldown lifecycle

Table: `battle_skill_cooldowns` (battleId, characterId, skillId, remainingTurns)
Unique on (battleId, characterId, skillId).

**Per-turn flow (start of every action):**
1. `tickCooldowns(battleId, characterId)` — decrements all remainingTurns > 0 by 1

**On skill use:**
2. Check remainingTurns == 0 or no row → allowed
3. After casting: UPSERT remainingTurns = skill.cooldownTurns

**On battle end (won / lost / fled):**
4. `cleanupBattleCooldowns(battleId)` — deletes all rows for that battle

**Why cleanup on end:** prevents rows accumulating forever across battles. The rows are battle-scoped; keeping them post-battle is never meaningful.
