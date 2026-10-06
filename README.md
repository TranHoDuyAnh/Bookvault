# 🏠 HOMEBASE — Trung Tâm Cuộc Sống

> **Personal Life OS** — *Ứng dụng quản lý cuộc sống toàn diện dành cho người Việt.*  
> *Sách, nhà cửa, tài chính, xe cộ, thói quen, nhật ký, giải trí — tất cả trong một.*

**HomeBase** là ứng dụng quản lý cuộc sống cá nhân toàn diện (Personal Life OS) với phong cách Editorial ấm áp. Ứng dụng giúp bạn tổ chức mọi khía cạnh cuộc sống: bộ sưu tập sách, tài sản cá nhân, phương tiện xe cộ, bảo trì nhà cửa, hoá đơn sinh hoạt, tài chính, thói quen, nhật ký, mục tiêu, giải trí và nhiều hơn nữa.

---

## ✨ Điểm Nổi Bật & Các Module Hệ Thống

### 🔔 1. Trung Tâm Thông Báo & Nhắc Lịch Toàn Năng (Global Notification Center)
- Nút chuông thông báo 🔔 tích hợp trên thanh điều hướng Header với **Huy hiệu đếm số sự kiện đến hạn trực tiếp**.
- Tự động quét và tổng hợp:
  - 💡 **Hoá đơn điện, nước, internet chưa thanh toán** (Utility Tracker).
  - 🚗 **Hạn đăng kiểm & bảo hiểm xe sắp tới trong 30 ngày** (Vehicle Manager).
  - 🏠 **Thiết bị trong nhà sắp hết hạn bảo hành** (Home Manager).
  - 🕵️ **Nhiệm vụ Mystery Box hôm nay chưa mở**.
  - 📅 **Ngày quan trọng sắp đến** (Sinh nhật, kỷ niệm...).

---

### 📚 2. Tủ Sách Số (Digital Bookshelf)
- 🔍 **Tra cứu tại nhà sách tức thì (`⌘K`)**: Quét/Tìm theo Tên sách, Tác giả hoặc Mã ISBN-10/13. Cảnh báo ngay lập tức *"BẠN ĐÃ SỞ HỮU CUỐN SÁCH NÀY"* kèm ngày mua, giá tiền và nơi mua.
- 📖 **Phân loại trạng thái**: `OWNED` (Đang sở hữu), `READING` (Đang đọc), `READ` (Đã đọc), `WISHLIST` (Muốn đọc), `DROPPED` (Đã bỏ).
- 📷 **Ảnh chụp sách thật**: Lưu trữ ảnh bìa trước, bìa sau, gáy sách, mã vạch trên Supabase Storage với Signed URLs 24h.
- ⏱️ **Nhật ký & Tiến độ đọc**: Theo dõi trang đang đọc, thời lượng đọc từng phiên và dòng thời gian lịch sử.
- 📝 **Ghi chú & Trích dẫn**: Lưu bài học tâm đắc gắn với từng số trang cụ thể.

---

### 📦 3. Personal Asset Manager (`/app/assets`)
- 💎 **Quản lý tài sản sở hữu**: Thiết bị công nghệ, phương tiện, đồng hồ/trang sức, nội thất, đồ sưu tầm...
- 📉 **Tính toán biến động giá trị & Khấu hao**: Giá lúc mua vs Giá trị ước tính hiện tại theo thị trường.
- 📍 **Vị trí cất giữ**: Ghi nhận nơi để (Phòng làm việc, Két sắt, Gara...) và số Serial thiết bị.

---

### 🚗 4. Vehicle Manager (`/app/vehicles`)
- 🛵 **Quản lý xe máy & ô tô**: Theo dõi đời xe, biển số, số Odo hiện tại.
- ⛽ **Nhật ký đổ xăng**: Số lít, giá xăng, tổng tiền, cây xăng và số km Odo.
- 🔧 **Lịch sử bảo dưỡng**: Ghi nhận thay nhớt máy, nhớt lap, lốp xe, bảo dưỡng phanh, rửa xe...
- 🛡️ **Cảnh báo hạn đăng kiểm & bảo hiểm**: Tự động đếm ngược và nhắc trước 30 ngày để không bị trễ hạn.

---

### 💡 5. Utility Tracker (`/app/utilities`)
- ⚡ **Hoá đơn sinh hoạt định kỳ**: Tiền điện, tiền nước, internet/wifi, cước 4G, phí dịch vụ chung cư, tiền rác.
- 📊 **Theo dõi chỉ số tiêu thụ**: Ghi nhận số kWh điện, m³ nước theo từng kỳ thanh toán.
- 💳 **Trạng thái thanh toán**: Đánh dấu *Đã đóng / Chưa đóng*, thống kê tổng số tiền cần thanh toán trong tháng.

---

### 🔧 6. Home Maintenance (`/app/maintenance`)
- 🔨 **Nhật ký sửa chữa nhà cửa**: Điện, nước, chống thấm, điều hoà, khoá cửa, sơn sửa tường...
- 👷 **Lưu thông tin thợ & nhà thầu**: Tên thợ, số điện thoại, chi phí thực hiện.
- 🛡️ **Bảo hành sửa chữa & Ảnh Before/After**: Theo dõi thời hạn bảo hành thi công và ảnh chụp so sánh.

---

### 🛠️ 7. Service History (`/app/services`)
- 💈 **Nhật ký sử dụng dịch vụ**: Bảo dưỡng xe, cắt tóc & spa, vệ sinh máy lạnh, sửa điện thoại, dọn dẹp nhà...
- ⭐ **Đánh giá chất lượng**: Đánh giá 1-5 sao ⭐, lưu địa chỉ tiệm quen uy tín để dễ dàng đặt lịch lần sau.

---

### 💰 8. Budget Tracker (`/app/budget`)
- 💳 **Theo dõi chi tiêu**: Ghi nhận chi tiêu hàng ngày theo danh mục & phương thức thanh toán.
- 📊 **Ngân sách theo tháng**: Đặt hạn mức chi tiêu cho từng loại và xem báo cáo so sánh.
- 💵 **Thu nhập**: Ghi nhận các nguồn thu nhập để có cái nhìn tổng thể tài chính.

---

### 🎯 9. Mục tiêu & OKR (`/app/goals`)
- 📋 **Mục tiêu theo kỳ**: Đặt mục tiêu cá nhân theo quý, năm với trạng thái theo dõi.
- 📈 **Key Results**: Chia nhỏ thành các kết quả đo lường được với thanh tiến độ %.

---

### ✅ 10. Habit Tracker (`/app/habits`)
- 🔥 **Thói quen hàng ngày/tuần**: Tạo thói quen với mục tiêu cụ thể.
- 🏆 **Chuỗi Streak**: Duy trì chuỗi ngày liên tiếp để xây dựng thói quen bền vững.

---

### 📝 11. Nhật Ký Cá Nhân (`/app/journal`)
- 💭 **Ghi chép hàng ngày**: Viết nhật ký với tâm trạng, tags và hình ảnh.
- 😊 **Mood Tracker**: Theo dõi cảm xúc mỗi ngày qua 5 mức độ.

---

### 🍜 12. Food Diary (`/app/food`)
- 🍲 **Nhật ký bữa ăn**: Bữa sáng, Bữa trưa, Bữa tối, Ăn vặt, Cà phê.
- 🏬 **Tự nấu vs Ăn ngoài**: Ghi nhận tên quán ăn, địa chỉ, giá tiền (₫) và món yêu thích ❤️.

---

### 🛒 13. Danh Sách Mua Sắm (`/app/shopping`)
- 📋 **Tạo nhiều list**: Chia theo siêu thị, chợ, online...
- ✅ **Tick từng món**: Đánh dấu đã mua, ước lượng chi phí.

---

### 📺 14. Giải Trí & Văn Hoá (`/app/entertainment`)
- 🎬 **Phim, Anime, Game, Podcast**: Theo dõi trạng thái xem/chơi.
- ⭐ **Đánh giá & Review**: Ghi nhận cảm nhận cá nhân.

---

### 📅 15. Ngày Quan Trọng (`/app/dates`)
- 🎂 **Sinh nhật & Kỷ niệm**: Nhắc tự động trước N ngày.
- 📌 **Sự kiện đặc biệt**: Lịch riêng tư không bỏ sót.

---

### 🕵️ 16. Mystery Box (`/app/mystery`)
- 🎁 **Hộp quà bí mật mỗi ngày**: Hiệu ứng unbox mở ra thử thách ngẫu nhiên giúp cuộc sống thú vị và phá vỡ lối mòn.
- 🔥 **Check-in & Chuỗi Streak**: Tải ảnh minh chứng, viết cảm nhận và tích luỹ điểm XP cùng chuỗi ngày liên tiếp.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Turbopack).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, Type-safe).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Tone màu ấm Editorial (`#FAF8F5`, `#1E3A2F`, `#F3EEE7`).
- **Database & Backend**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage, Row Level Security).
- **State & Cache**: [@tanstack/react-query](https://tanstack.com/query) v5.
- **Typography**: Font tiếng Việt cao cấp **Lora** (Serif) & **Be Vietnam Pro** (Sans-serif).
- **Icons & Thông báo**: [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

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
homebase/
├── src/
│   ├── app/                         # Next.js App Router Pages
│   │   ├── page.tsx                 # Landing page
│   │   ├── login/page.tsx           # Đăng nhập
│   │   ├── register/page.tsx        # Đăng ký
│   │   └── app/                     # Authenticated Life OS Hub
│   │       ├── dashboard/page.tsx   # Tổng quan HomeBase
│   │       ├── library/page.tsx     # Tủ sách của tôi
│   │       ├── library/[id]/page.tsx# Chi tiết sách
│   │       ├── reading/page.tsx     # Sách đang đọc
│   │       ├── wishlist/page.tsx    # Sách muốn mua
│   │       ├── notes/page.tsx       # Tổng hợp ghi chú
│   │       ├── tags/page.tsx        # Quản lý thẻ
│   │       ├── assets/page.tsx      # 📦 Quản lý tài sản cá nhân
│   │       ├── vehicles/page.tsx    # 🚗 Xe & Xăng cộ
│   │       ├── maintenance/page.tsx # 🔧 Sửa chữa & bảo trì
│   │       ├── utilities/page.tsx   # 💡 Hoá đơn định kỳ
│   │       ├── services/page.tsx    # 🛠️ Lịch sử dịch vụ
│   │       ├── budget/page.tsx      # 💰 Budget Tracker
│   │       ├── savings/page.tsx     # 🐷 Mục tiêu tiết kiệm
│   │       ├── habits/page.tsx      # ✅ Habit Tracker
│   │       ├── journal/page.tsx     # 📝 Nhật ký cá nhân
│   │       ├── goals/page.tsx       # 🎯 Mục tiêu & OKR
│   │       ├── shopping/page.tsx    # 🛒 Danh sách mua sắm
│   │       ├── entertainment/page.tsx # 📺 Giải trí & Văn hoá
│   │       ├── dates/page.tsx       # 📅 Ngày quan trọng
│   │       ├── food/page.tsx        # 🍜 Food Diary
│   │       ├── home/page.tsx        # 🏠 Đồ đạc trong nhà
│   │       ├── mystery/page.tsx     # 🕵️ Mystery Box
│   │       └── settings/page.tsx    # Cài đặt tài khoản
│   ├── components/
│   │   ├── assets/                  # AssetCard, AddAssetModal...
│   │   ├── vehicles/                # VehicleCard, AddVehicleModal, AddFuelModal...
│   │   ├── maintenance/             # MaintenanceCard, AddMaintenanceModal...
│   │   ├── utilities/               # UtilityBillCard, AddUtilityModal...
│   │   ├── services/                # ServiceRecordCard, AddServiceModal...
│   │   ├── layout/                  # Sidebar, Header, NotificationBell, MobileNav...
│   │   └── ui/                      # Button, Input, Modal, Skeleton...
│   ├── hooks/                       # useAssets, useVehicles, useMaintenance...
│   ├── services/                    # assets, vehicles, maintenance, utilities...
│   ├── types/                       # database.ts
│   └── proxy.ts                     # Next.js 16 Session Middleware
├── db.md                            # Complete SQL schema source of truth
└── README.md
```

---

## 📜 Giấy Phép
Dự án được phát triển dưới giấy phép MIT.
