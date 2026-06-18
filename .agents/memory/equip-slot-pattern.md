---
name: EquipSlot vs ItemType
description: equipSlot column is separate from item type; slot-based deduplication and character field mapping both use equipSlot
---

# EquipSlot vs ItemType

`inventoryTable` has two separate fields:
- `type` — item category (weapon/armor/consumable/accessory/material)
- `equipSlot` — nullable, which slot it occupies (weapon/armor/accessory)

**Why separate:** An "accessory" type item needs its own equip slot distinct from weapon/armor. Consumables and materials have no slot (null).

**How to apply:**
- When inserting dropped items, always set `equipSlot` explicitly (e.g. `equipSlot: type as "weapon"|"armor"`).
- Equip validation uses `equipSlot` (not `type`) for the "unequip same slot" query.
- For legacy items without equipSlot, `deriveSlotFromType()` in inventory.ts provides a fallback.
- `charactersTable` mirrors equipped item names: equippedWeapon / equippedArmor / equippedAccessory.
