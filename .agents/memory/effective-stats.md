---
name: Effective stats pattern
description: getEffectiveStats() centralizes all stat calculation; battle handlers must use it, never raw characterStatsTable values
---

# Effective stats pattern

`artifacts/api-server/src/utils/effectiveStats.ts` exports `getEffectiveStats(characterId)`.

**Rule:** Battle handlers (and any future combat-adjacent code) MUST call `getEffectiveStats()` instead of reading `characterStatsTable.attack / defense` directly.

**Why:** Equipment bonuses (attackBonus/defenseBonus on inventoryTable where isEquipped=true) must be included in combat. Without this, equipped gear has no effect in battle.

**How to apply:** 
- Destructure `{ base, effectiveAttack, effectiveDefense, critRate }` from the return value.
- Use `effectiveAttack`/`effectiveDefense` for all damage calculations.
- Use `base.attack`/`base.defense` only when writing permanent stat changes (level-up deltas are written to characterStatsTable, not the effective values).
