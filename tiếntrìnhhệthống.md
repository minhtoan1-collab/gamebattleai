# Tiến Trình Hệ Thống — RPG World Nhập Vai Chiến Đấu

> Tài liệu mô tả toàn bộ cơ chế tiến trình trong game nhập vai chiến đấu NPC.

---

## 1. Tổng Quan Hệ Thống

RPG World là game nhập vai nơi người chơi tạo nhân vật, khám phá các thế giới khác nhau, chiến đấu với NPC (non-player character), thu thập trang bị và phát triển nhân vật theo thời gian.

```
Người chơi → Tạo nhân vật → Chọn thế giới → Chiến đấu NPC → Nhận XP/Gold → Lên cấp → Trang bị mạnh hơn → Thế giới khó hơn
```

---

## 2. Nhân Vật (Character)

### 2.1 Các Lớp Nhân Vật

| Lớp       | Điểm Mạnh                  | Điểm Yếu             |
|-----------|----------------------------|----------------------|
| Chiến Binh | HP cao, phòng thủ tốt      | Tốc độ chậm          |
| Pháp Sư   | Sát thương phép thuật cao  | HP thấp              |
| Thích Khách | Tốc độ nhanh, chí mạng cao | Phòng thủ thấp      |
| Cung Thủ  | Tầm xa, ổn định            | Yếu trong cận chiến  |

### 2.2 Chỉ Số Nhân Vật

| Chỉ Số    | Mô Tả                              |
|-----------|------------------------------------|
| HP        | Máu hiện tại / tối đa              |
| XP        | Điểm kinh nghiệm tích lũy         |
| Gold      | Vàng để mua trang bị              |
| Attack    | Sát thương cơ bản mỗi đòn         |
| Defense   | Giảm sát thương nhận vào          |
| Speed     | Xác định lượt tấn công trước      |
| Crit Rate | % cơ hội chí mạng (x2 sát thương) |

---

## 3. Hệ Thống Cấp Độ (Level System)

### 3.1 Công Thức Lên Cấp

```
XP cần để lên cấp N = 100 × N × 1.5
```

| Cấp | XP Cần | XP Cộng Dồn |
|-----|--------|-------------|
| 1→2 | 150    | 150         |
| 2→3 | 300    | 450         |
| 3→4 | 450    | 900         |
| 4→5 | 600    | 1500        |
| 5→6 | 750    | 2250        |
| ... | ...    | ...         |
| N   | 100×N×1.5 | ...      |

### 3.2 Thưởng Khi Lên Cấp

Mỗi lần lên cấp, nhân vật nhận:
- **+10 HP tối đa**
- **+2 Attack**
- **+1 Defense**
- **+1 Speed**
- **Hồi toàn bộ HP**

---

## 4. Thế Giới (Worlds)

### 4.1 Danh Sách Thế Giới

| Thế Giới          | Chủ Đề          | Cấp Tối Thiểu | Đặc Điểm         |
|-------------------|-----------------|---------------|------------------|
| Rừng Nguyên Thủy  | Nature          | 1             | Thế giới mở đầu  |
| Lâu Đài Bóng Tối  | Dark Fantasy    | 5             | NPC mạnh hơn     |
| Hang Động Long Mạch | Dragon        | 10            | Boss rồng        |
| Thành Phố Hơi Nước | Steampunk      | 15            | Cơ giới NPC      |
| Cõi Linh Giới     | Mythic          | 20            | Boss thần thánh  |

### 4.2 Cơ Chế Thế Giới

- Mỗi thế giới có **yêu cầu cấp độ tối thiểu**
- Thế giới cao hơn có NPC khó hơn nhưng **thưởng XP/Gold nhiều hơn**
- Mỗi thế giới có **1 NPC Boss** (thưởng đặc biệt khi đánh bại)
- Sau khi đánh bại Boss → mở khóa thế giới tiếp theo

---

## 5. NPC Và Hệ Thống Kẻ Thù

### 5.1 Phân Loại NPC

| Loại NPC    | Độ Khó  | Nhân XP | Đặc Điểm            |
|-------------|---------|---------|---------------------|
| Thường      | Easy    | ×1      | NPC cơ bản          |
| Tinh Anh    | Normal  | ×2      | HP và Attack cao hơn |
| Cường Hóa   | Hard    | ×3      | Có kỹ năng đặc biệt |
| Boss        | Boss    | ×5      | Boss của thế giới    |

### 5.2 Phần Thưởng Từ NPC

```
XP nhận được = XP_cơ_bản × nhân_độ_khó × (1 + 0.1 × (Cấp_NPC - Cấp_nhân_vật))
Gold nhận được = Gold_cơ_bản × nhân_độ_khó
```

---

## 6. Hệ Thống Chiến Đấu (Battle System)

### 6.1 Luồng Chiến Đấu

```
Bắt đầu trận → Lượt người chơi → Chọn hành động → Kết quả → Lượt NPC → ...
→ (Một bên HP = 0) → Kết thúc → Phân phối phần thưởng
```

### 6.2 Các Hành Động Chiến Đấu

| Hành Động | Mô Tả                              | Hiệu Ứng                            |
|-----------|------------------------------------|-------------------------------------|
| **Tấn Công** | Đòn tấn công thường             | Gây Attack × Random(0.8-1.2) sát thương |
| **Kỹ Năng**  | Tấn công mạnh hơn (mỗi 3 lượt)  | Gây Attack × 1.8, bỏ qua 20% phòng thủ |
| **Phòng Thủ** | Tăng phòng thủ 1 lượt           | Giảm 50% sát thương nhận vào        |
| **Tẩu Thoát** | Rời khỏi trận                  | 50% thành công, thất bại mất lượt   |

### 6.3 Công Thức Sát Thương

```
Sát thương = max(1, Attack × hệ_số - Defense × 0.5) × hệ_số_ngẫu_nhiên(0.8-1.2)
Chí mạng: nếu random(0-100) < CritRate → sát thương × 2
```

### 6.4 Kết Quả Trận Đấu

| Kết Quả    | Điều Kiện       | Phần Thưởng                    |
|------------|-----------------|-------------------------------|
| Thắng      | NPC HP = 0      | +XP, +Gold, +có thể nhận đồ   |
| Thua       | Nhân vật HP = 0 | HP về 1, mất 10% Gold          |
| Tẩu thoát  | Hành động flee  | Không mất HP, không nhận XP   |

---

## 7. Hệ Thống Trang Bị (Inventory & Equipment)

### 7.1 Loại Vật Phẩm

| Loại       | Slot    | Tác Dụng          |
|------------|---------|-------------------|
| Vũ Khí     | Weapon  | Tăng Attack       |
| Giáp       | Armor   | Tăng Defense      |

### 7.2 Độ Hiếm Vật Phẩm

| Độ Hiếm   | Màu Sắc | Bonus Attack | Bonus Defense |
|-----------|---------|--------------|---------------|
| Thường    | Trắng   | +1 - +3      | +1 - +2       |
| Hiếm      | Xanh    | +4 - +7      | +3 - +5       |
| Sử Thi    | Tím     | +8 - +12     | +6 - +9       |
| Huyền Thoại | Vàng  | +13 - +20    | +10 - +15     |

### 7.3 Cơ Chế Thu Thập Đồ

- Đánh bại NPC có **30% cơ hội** drop vật phẩm
- Boss luôn drop **ít nhất 1 vật phẩm Hiếm trở lên**
- Độ hiếm của đồ drop tương quan với độ khó NPC

---

## 8. Hệ Thống Tiến Trình Toàn Cầu

### 8.1 Bảng Xếp Hạng (Leaderboard)

Nhân vật được xếp hạng dựa trên:
1. **Cấp độ** (ưu tiên cao nhất)
2. **Số trận thắng**
3. **Tổng XP**

### 8.2 Thống Kê Game

Theo dõi các chỉ số toàn server:
- Tổng số nhân vật đang hoạt động
- Tổng số trận chiến đã diễn ra
- Tổng NPC đã bị đánh bại
- Lớp nhân vật phổ biến nhất
- Số thế giới đã được khám phá

---

## 9. Tiến Trình Mốc Quan Trọng (Milestones)

| Mốc                    | Điều Kiện                | Phần Thưởng                |
|------------------------|--------------------------|----------------------------|
| Chiến Binh Đầu Tiên    | Thắng trận đầu tiên      | +50 Gold                   |
| Người Khám Phá         | Vào thế giới mới         | +100 XP                    |
| Thợ Săn NPC            | Đánh bại 10 NPC          | Vật phẩm Hiếm              |
| Kẻ Giết Boss           | Đánh bại Boss đầu tiên   | Vật phẩm Sử Thi            |
| Chiến Thần             | Đạt cấp 20               | Vật phẩm Huyền Thoại       |
| Nhà Vô Địch            | Hạng 1 bảng xếp hạng    | Danh hiệu đặc biệt         |

---

## 10. Luồng Tiến Trình Điển Hình

```
[Mới Bắt Đầu]
    → Tạo nhân vật (chọn lớp)
    → Vào Rừng Nguyên Thủy (cấp 1-4)
    → Đánh NPC Thường → Nhận XP/Gold
    → Lên Cấp 2, 3, 4 → Chỉ số tăng
    → Đánh bại Boss Rừng → Nhận đồ Hiếm + Mở Lâu Đài
    
[Giai Đoạn Giữa]
    → Vào Lâu Đài Bóng Tối (cấp 5-9)
    → Trang bị đồ mạnh hơn → Attack/Defense tăng
    → Đánh Boss Lâu Đài → Mở Hang Động
    
[Nâng Cao]
    → Hang Động Long Mạch → Thành Phố Hơi Nước → Cõi Linh Giới
    → Đạt cấp tối đa → Leo bảng xếp hạng
    → Thu thập đồ Huyền Thoại
    
[Endgame]
    → Hạng 1 Leaderboard
    → Hoàn thành tất cả thế giới
    → Nhận danh hiệu Chiến Thần
```

---

## 11. API Endpoints Hệ Thống

| Endpoint                         | Phương Thức | Chức Năng                        |
|----------------------------------|-------------|----------------------------------|
| `/api/characters`                | GET/POST    | Danh sách / Tạo nhân vật        |
| `/api/characters/{id}`           | GET/DELETE  | Chi tiết / Xoá nhân vật         |
| `/api/characters/{id}/stats`     | GET         | Chỉ số chiến đấu nhân vật       |
| `/api/characters/{id}/inventory` | GET         | Kho đồ nhân vật                 |
| `/api/characters/{id}/equip`     | POST        | Trang bị vật phẩm               |
| `/api/worlds`                    | GET         | Danh sách thế giới              |
| `/api/worlds/{id}`               | GET         | Chi tiết thế giới               |
| `/api/worlds/{id}/npcs`          | GET         | NPC trong thế giới              |
| `/api/npcs`                      | GET         | Tất cả NPC                      |
| `/api/battles`                   | GET/POST    | Lịch sử / Bắt đầu trận         |
| `/api/battles/{id}`              | GET         | Chi tiết trận chiến             |
| `/api/battles/{id}/action`       | POST        | Thực hiện hành động             |
| `/api/progression/leaderboard`   | GET         | Bảng xếp hạng                  |
| `/api/progression/summary`       | GET         | Tổng quan tiến trình game       |

---

## 12. Stack Kỹ Thuật

| Thành Phần | Công Nghệ               |
|------------|-------------------------|
| Frontend   | React + Vite + TypeScript |
| Styling    | Tailwind CSS + shadcn/ui |
| State      | TanStack Query (React Query) |
| Backend    | Express 5 + TypeScript  |
| Database   | PostgreSQL + Drizzle ORM |
| Validation | Zod (API contract)      |
| API Spec   | OpenAPI 3.1             |

---

*Tài liệu được tạo ngày 17/06/2026 — RPG World System v1.0*

---

## 🔄 Auto-Build Log — 17/06/2026 18:45:24

| Thông Tin       | Giá Trị                   |
|-----------------|---------------------------|
| Thời gian mở    | 17/06/2026 18:45:24                |
| Tài khoản       | hamletjun1              |
| Repl ID         | 260ac21f-1df5-40f4-8ab7-e3480d12cb2c                |
| Repl Slug       | workspace              |
| Trạng thái      | ✅ Dự án đã khởi động    |

*Ghi tự động khi mở dự án — RPG World Auto-Build System*
