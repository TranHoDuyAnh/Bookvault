# 📚 BOOKVAULT & LIFE OS

> **"Never buy the same book twice."** — *Không bao giờ mua trùng một cuốn sách hai lần.*  
> *Hệ sinh thái Tủ sách số & Quản trị phong cách sống cá nhân (Personal Life OS).*

**BookVault** là ứng dụng tủ sách số cá nhân chuẩn phong cách Editorial kết hợp nền tảng quản trị cuộc sống (Life OS). Ứng dụng giúp bạn quản lý toàn bộ bộ sưu tập sách, lưu giữ ảnh chụp thực tế, nhật ký ẩm thực món ngon, quản lý thiết bị gia dụng / bảo hành trong nhà và mở khoá nhiệm vụ bí mật mỗi ngày.

---

## ✨ Điểm Nổi Bật & Các Module Hệ Thống

### 📚 1. Tủ Sách Số (Digital Bookshelf)
- 🔍 **Tra cứu tại nhà sách tức thì (`⌘K`)**: Quét/Tìm theo Tên sách, Tác giả hoặc Mã ISBN-10/13. Cảnh báo ngay lập tức *"BẠN ĐÃ SỞ HỮU CUỐN SÁCH NÀY"* kèm ngày mua, giá tiền và nơi mua.
- 📖 **Phân loại trạng thái**: `OWNED` (Đang sở hữu), `READING` (Đang đọc), `READ` (Đã đọc), `WISHLIST` (Muốn đọc), `DROPPED` (Đã bỏ).
- 📷 **Ảnh chụp sách thật (Physical Photos)**: Lưu trữ ảnh bìa trước, bìa sau, gáy sách, mã vạch an toàn trên Supabase Private Storage với Signed URLs 24h.
- ⏱️ **Nhật ký & Tiến độ đọc**: Theo dõi trang đang đọc, thời lượng đọc từng phiên và dòng thời gian lịch sử.
- 📝 **Ghi chú & Trích dẫn**: Lưu bài học tâm đắc gắn với từng số trang cụ thể.

---

### 🍜 2. Food Diary & Khám Phá Món Ngon (`/app/food`)
- 🍲 **Nhật ký bữa ăn**: Lưu lại những món ăn ngon hàng ngày theo bữa (Sáng, Trưa, Tối, Ăn vặt, Cà phê).
- 🏬 **Phân loại Tự nấu vs Ăn ngoài**: Ghi nhận tên quán ăn, địa chỉ, giá tiền (₫) và đánh giá sao (1-5 ⭐).
- ❤️ **Món yêu thích**: Đánh dấu các món ăn/quán ăn muốn quay lại.
- 📊 **Thống kê ẩm thực**: Tổng số món, tỷ lệ tự nấu tại nhà vs ăn ngoài, và tổng chi tiêu ăn uống.

---

### 🏠 3. Home Manager & Quản Lý Thiết Bị (`/app/home`)
- 🛋️ **Quản lý đồ đạc theo phòng**: Phân loại thiết bị theo Phòng khách, Bếp, Bàn làm việc, Phòng ngủ...
- 🛡️ **Theo dõi & Cảnh báo hạn bảo hành**: Đếm ngược số ngày bảo hành còn lại, cảnh báo đồ sắp hết hạn trong 30 ngày tới.
- 🧾 **Lưu ảnh phiếu bảo hành & Hoá đơn**: Lưu trữ ảnh chụp giấy tờ bảo hành trực tiếp cùng thiết bị.
- 🔧 **Nhật ký bảo dưỡng & Chi phí sửa chữa**: Ghi lại lịch sử thay linh kiện, sửa chữa và tổng tiền bảo trì.

---

### 🕵️ 4. Mystery Box & Nhiệm Vụ Ngày (`/app/mystery`)
- 🎁 **Hộp quà bí mật mở khoá mỗi ngày**: Hiệu ứng unbox mở ra thử thách ngẫu nhiên giúp cuộc sống thú vị, đa dạng và phá vỡ lối mòn.
- 🌟 **Đa dạng chủ đề**: Ẩm thực (Food), Tâm trí (Mindfulness), Nhà cửa (Home), Khám phá (Adventure), Đọc sách (Reading).
- 🔥 **Check-in & Chuỗi Streak**: Tải ảnh minh chứng, viết cảm nhận và tích luỹ điểm XP cùng chuỗi ngày liên tiếp.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Server Components & Client Components, Turbopack).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, Type-safe).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Tone màu ấm Editorial (`#FAF8F5`, `#1E3A2F`, `#F3EEE7`).
- **Database & Backend**: [Supabase](https://supabase.com/)
  - **Supabase Auth**: Đăng ký, đăng nhập, khôi phục mật khẩu, bảo mật phiên làm việc.
  - **PostgreSQL**: RLS (Row Level Security), Trigger tự động đồng bộ Profile, View `my_library`.
  - **Supabase Storage**: Bucket riêng tư `book-images` cho sách, đồ đạc, món ăn và nhiệm vụ.
- **Quản lý State & Cache**: [@tanstack/react-query](https://tanstack.com/query) v5.
- **Typography**: Bộ font tiếng Việt chuẩn mực **Lora** (Serif) & **Be Vietnam Pro** (Sans-serif).
- **Icons & Thông báo**: [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Biến Môi Trường (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Khởi tạo Cơ Sở Dữ Liệu
Chạy toàn bộ file script [`db.md`](./db.md) trong mục **SQL Editor** trên Supabase Dashboard.

### 4. Chạy Development Server
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000).

### 5. Build Kiểm Tra Production
```bash
npm run build
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```
bookvault/
├── src/
│   ├── app/                         # Next.js App Router Pages
│   │   ├── page.tsx                 # Landing page
│   │   ├── login/page.tsx           # Đăng nhập
│   │   ├── register/page.tsx        # Đăng ký
│   │   └── app/                     # Authenticated Life OS Hub
│   │       ├── dashboard/page.tsx   # Tổng quan Sách + Food + Home + Mystery
│   │       ├── library/page.tsx     # Tủ sách của tôi
│   │       ├── library/[id]/page.tsx# Chi tiết sách & Thông tin sở hữu cá nhân
│   │       ├── reading/page.tsx     # Sách đang đọc
│   │       ├── wishlist/page.tsx    # Sách muốn mua
│   │       ├── notes/page.tsx       # Tổng hợp ghi chú
│   │       ├── tags/page.tsx        # Quản lý thẻ
│   │       ├── food/page.tsx        # 🍜 Food Diary & Món ngon
│   │       ├── home/page.tsx        # 🏠 Home Manager & Bảo hành
│   │       ├── mystery/page.tsx     # 🕵️ Mystery Box & Nhiệm vụ ngày
│   │       └── settings/page.tsx    # Cài đặt tài khoản & Profile
│   ├── components/
│   │   ├── books/                   # BookCard, BookCover, EditPersonalInfoModal...
│   │   ├── food/                    # FoodCard, AddFoodModal...
│   │   ├── home/                    # HomeItemCard, AddHomeItemModal, MaintenanceModal...
│   │   ├── mystery/                 # MysteryBoxCard, QuestCompleteModal...
│   │   ├── layout/                  # Sidebar, Header, MobileNav, AppLayout...
│   │   └── ui/                      # Button, Input, Modal, Skeleton...
│   ├── hooks/                       # useLibrary, useFood, useHome, useMystery, useUser...
│   ├── services/                    # library, food, home, mystery, storage, auth...
│   ├── types/                       # database.ts
│   └── proxy.ts                     # Next.js 16 Session Middleware
├── db.md                            # Complete SQL schema source of truth
└── README.md
```

---

## 🔒 Bảo Mật & RLS (Security)
- RLS (Row Level Security) được kích hoạt trên tất cả các bảng (`books`, `food_entries`, `home_items`, `home_rooms`, `home_maintenance_logs`, `user_daily_quests`).
- Bucket `book-images` lưu trữ ở chế độ riêng tư (Private); ảnh tải lên được tạo URL bảo mật có thời hạn (Signed URLs).

---

## 📜 Giấy Phép
Dự án được phát triển dưới giấy phép MIT.
