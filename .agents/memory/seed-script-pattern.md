---
name: Seed script pattern
description: How to write and run TS seed files in this monorepo
---

# Seed script pattern

Seed files live in `lib/db/src/seed/*.ts`. Each one exports an async function AND self-executes:

```ts
export async function seedX() { ... }
seedX().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
```

**Why:** tsx runs the file as a script; without the self-executing call, nothing runs.

**How to run:**
```
DATABASE_URL="$DATABASE_URL" npx tsx lib/db/src/seed/skills.ts
```

tsx is available via `npx tsx` (not in PATH directly; not via `pnpm exec tsx`).
