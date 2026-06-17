# RPG World — Nhập Vai Chiến Đấu

Game nhập vai trình duyệt nơi người chơi tạo nhân vật, khám phá thế giới huyền bí và chiến đấu với NPC.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — chạy API server (port 8080)
- `pnpm --filter @workspace/rpg-world run dev` — chạy frontend (port tự động)
- `pnpm run typecheck` — kiểm tra toàn bộ TypeScript
- `pnpm run build` — build toàn bộ
- `pnpm --filter @workspace/api-spec run codegen` — tái tạo API hooks và Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (từ OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth cho API)
- `lib/db/src/schema/` — Drizzle schema (characters, worlds, npcs, battles, inventory)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/rpg-world/src/pages/` — React pages (home, characters, worlds, battle, leaderboard)
- `artifacts/rpg-world/src/components/layout.tsx` — Layout và navbar chính
- `tiếntrìnhhệthống.md` — Tài liệu chi tiết hệ thống tiến trình

## Architecture decisions

- OpenAPI-first: spec trong `lib/api-spec/openapi.yaml` generate ra cả React Query hooks lẫn Zod validators
- Battle system stateful: mỗi trận chiến lưu vào DB với log từng lượt, HP realtime
- XP-based leveling: công thức `100 × level × 1.5` cho mỗi cấp, stats tăng sau mỗi level up
- Item drop: 30% chance từ NPC thường, 100% drop từ Boss (ít nhất đồ Hiếm)
- Dark-only theme: toàn app dark mode với palette crimson đỏ + amber vàng

## Product

- Tạo nhân vật với 4 lớp: Chiến Binh, Pháp Sư, Thích Khách, Cung Thủ
- 5 thế giới có yêu cầu cấp độ tăng dần (cấp 1 → 20)
- 25 NPC với 4 mức độ khó (Easy/Normal/Hard/Boss)
- Chiến đấu theo lượt với 4 hành động: Tấn Công, Kỹ Năng, Phòng Thủ, Tẩu Thoát
- Hệ thống kho đồ và trang bị với 4 độ hiếm
- Bảng xếp hạng toàn cầu

## User preferences

_Trống — điền khi có chỉ định rõ từ người dùng._

## Gotchas

- Sau khi thay đổi `lib/api-spec/openapi.yaml`, phải chạy codegen trước khi dùng hooks mới
- Không đặt tên schema trong OpenAPI theo dạng `<OperationIdPascal>Body` — sẽ gây lỗi TS2308
- Không dùng `console.log` trong server — dùng `req.log` hoặc `logger` từ pino

## Pointers

- Xem `tiếntrìnhhệthống.md` để hiểu toàn bộ cơ chế game
- Xem `pnpm-workspace` skill cho cấu trúc monorepo và TypeScript setup
