import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Home,
  Car,
  TrendingUp,
  PiggyBank,
  CheckSquare,
  BookMarked,
  Target,
  ShoppingCart,
  Tv,
  CalendarHeart,
  Utensils,
  Gift,
  Wrench,
  Zap,
  Package,
  Library,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const hubs = [
    {
      icon: Library,
      title: 'Tủ sách số',
      desc: 'Quản lý sách đã mua, đang đọc, ghi chú & ảnh chụp bìa thật.',
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: Home,
      title: 'Đồ đạc trong nhà',
      desc: 'Theo dõi bảo hành, giá mua, vị trí từng thiết bị & đồ nội thất.',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      icon: TrendingUp,
      title: 'Budget Tracker',
      desc: 'Ghi chi tiêu hàng ngày, phân loại theo danh mục & phương thức thanh toán.',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      icon: PiggyBank,
      title: 'Mục tiêu tiết kiệm',
      desc: 'Đặt mục tiêu tài chính, theo dõi tiến độ & góp tiền dần từng ngày.',
      color: 'bg-teal-100 text-teal-800',
    },
    {
      icon: Car,
      title: 'Xe & Xăng cộ',
      desc: 'Lịch sử đổ xăng, bảo dưỡng, hạn đăng kiểm & bảo hiểm xe.',
      color: 'bg-sky-100 text-sky-800',
    },
    {
      icon: Package,
      title: 'Quản lý tài sản',
      desc: 'Theo dõi giá trị, tình trạng & thông tin mọi tài sản cá nhân.',
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      icon: CheckSquare,
      title: 'Habit Tracker',
      desc: 'Xây dựng thói quen tốt hàng ngày với chuỗi streak & nhắc nhở.',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: BookMarked,
      title: 'Nhật ký cá nhân',
      desc: 'Ghi lại suy nghĩ, tâm trạng & khoảnh khắc đáng nhớ mỗi ngày.',
      color: 'bg-violet-100 text-violet-800',
    },
    {
      icon: Target,
      title: 'Mục tiêu & OKR',
      desc: 'Đặt mục tiêu dài hạn, chia nhỏ thành key results & theo dõi %.',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      icon: Utensils,
      title: 'Food Diary',
      desc: 'Nhật ký ăn uống, đánh giá quán & lưu lại món ăn yêu thích.',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      icon: Tv,
      title: 'Giải trí & Văn hoá',
      desc: 'Theo dõi phim, game, podcast & anime đang xem hoặc muốn xem.',
      color: 'bg-rose-100 text-rose-800',
    },
    {
      icon: ShoppingCart,
      title: 'Danh sách mua sắm',
      desc: 'Tạo list mua sắm chung, tick từng món & ước lượng chi phí.',
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  const extraFeatures = [
    { icon: Wrench, title: 'Sửa chữa & Bảo trì', desc: 'Lịch sử sửa chữa nhà cửa, chi phí & thông tin thợ.' },
    { icon: Zap, title: 'Hoá đơn định kỳ', desc: 'Theo dõi điện, nước, internet & hạn đóng tiền.' },
    { icon: CalendarHeart, title: 'Ngày quan trọng', desc: 'Nhắc sinh nhật, kỷ niệm & sự kiện đặc biệt.' },
    { icon: Gift, title: 'Mystery Box', desc: 'Nhiệm vụ bất ngờ mỗi ngày giúp cuộc sống thú vị hơn.' },
    { icon: Bell, title: 'Thông báo thông minh', desc: 'Nhắc nhở tự động khi hết hạn, quá hạn & sắp tới.' },
    { icon: Wrench, title: 'Lịch sử dịch vụ', desc: 'Ghi nhận mọi dịch vụ đã sử dụng & đánh giá chất lượng.' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#21201c] flex flex-col selection:bg-[#1e3a2f]/20">
      {/* Navigation */}
      <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-[#e7e2d9] bg-[#faf8f5]/90 backdrop-blur-md px-6 sm:px-12 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a2f] text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 block leading-tight">
              HomeBase
            </span>
            <span className="text-[10px] text-stone-500 font-medium tracking-wide">
              Trung Tâm Cuộc Sống
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-xs font-semibold">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button className="text-xs font-semibold shadow-sm">
              Bắt đầu miễn phí
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative px-6 pt-16 pb-16 sm:pt-28 sm:pb-24 max-w-5xl mx-auto text-center space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Personal Life OS — Tất cả trong một</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
          Một nơi duy nhất để <br className="hidden sm:inline" />
          <span className="text-[#1e3a2f] italic underline decoration-emerald-500/40 underline-offset-8">
            quản lý mọi thứ trong cuộc sống.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
          Sách, nhà cửa, tài chính, xe cộ, thói quen, nhật ký, mua sắm, giải trí&hellip; Tất cả được tổ chức gọn gàng trong một ứng dụng duy nhất, giúp bạn sống có trật tự & không bỏ sót điều gì.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 text-sm font-semibold shadow-md h-12 px-8">
              Bắt đầu sử dụng HomeBase
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-sm font-semibold h-12 px-6">
              Đăng nhập
            </Button>
          </Link>
        </div>

        {/* ─── Hero Visual: Life Dashboard Preview ─── */}
        <div className="pt-10 relative max-w-4xl mx-auto">
          <div className="rounded-2xl border border-[#e7e2d9] bg-white p-5 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5 text-xs text-stone-500">
              <span className="font-serif font-bold text-stone-800 text-sm">🏠 Bảng điều khiển cuộc sống</span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">15+ tính năng</span>
            </div>

            {/* Mini hub cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {[
                { emoji: '📚', label: '42 cuốn sách', sub: '3 đang đọc', accent: 'border-emerald-200 bg-emerald-50/60' },
                { emoji: '🏠', label: '28 đồ đạc', sub: '2 sắp hết BH', accent: 'border-amber-200 bg-amber-50/60' },
                { emoji: '💰', label: '8.2M chi tháng', sub: '↓12% so T.trước', accent: 'border-blue-200 bg-blue-50/60' },
                { emoji: '🚗', label: 'Honda SH 150i', sub: 'Đăng kiểm: 45 ngày', accent: 'border-sky-200 bg-sky-50/60' },
                { emoji: '✅', label: '5 thói quen', sub: 'Streak: 12 ngày', accent: 'border-emerald-200 bg-emerald-50/60' },
                { emoji: '📝', label: 'Nhật ký', sub: '7 entry tuần này', accent: 'border-violet-200 bg-violet-50/60' },
                { emoji: '🎯', label: '3 mục tiêu', sub: '67% hoàn thành', accent: 'border-amber-200 bg-amber-50/60' },
                { emoji: '🔔', label: '4 nhắc nhở', sub: '2 khẩn cấp', accent: 'border-rose-200 bg-rose-50/60' },
              ].map((card, i) => (
                <div key={i} className={`rounded-xl border p-3 sm:p-3.5 text-left transition-all hover:scale-[1.02] ${card.accent}`}>
                  <span className="text-lg sm:text-xl">{card.emoji}</span>
                  <p className="font-semibold text-[11px] sm:text-xs text-stone-800 mt-1.5 leading-tight">{card.label}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pain Point → Solution ─── */}
      <section className="bg-[#f3eee7]/70 py-16 sm:py-20 px-6 sm:px-12 border-y border-[#e7e2d9]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a2f]">Vấn đề thực tế</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Cuộc sống bận rộn, mọi thứ nằm rải rác khắp nơi?
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Sổ tay một nơi, Excel một nẻo, app ghi chú không tìm lại được. Bạn quên hạn bảo hành, quên ngày đăng kiểm, quên mình đã mua cuốn sách nào&hellip;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-2xl bg-rose-50/80 border border-rose-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-rose-900">❌ Khi chưa có HomeBase</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-rose-800">
                {[
                  'Chi tiêu vượt ngân sách mà không biết tiền đi đâu.',
                  'Quên hạn bảo hành, đăng kiểm xe, bảo hiểm cho đến khi quá hạn.',
                  'Mua trùng sách vì không nhớ mình đã có cuốn nào.',
                  'Thói quen tốt bỏ dở vì không ai nhắc & không thấy tiến triển.',
                  'Ghi chú rải rác trên 5 app khác nhau, không tìm lại được.',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-emerald-900">✅ Khi đã dùng HomeBase</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-800">
                {[
                  { bold: 'Một dashboard duy nhất', rest: ' để xem tổng quan mọi khía cạnh cuộc sống.' },
                  { bold: 'Thông báo thông minh', rest: ' nhắc trước khi quá hạn — bảo hành, xe, hoá đơn.' },
                  { bold: 'Tra cứu 1 giây', rest: ' — gõ tên sách, đồ đạc, chi tiêu là ra ngay.' },
                  { bold: 'Dữ liệu có hệ thống', rest: ' — biết mình chi bao nhiêu, sở hữu gì, đọc đến đâu.' },
                  { bold: 'Thói quen bền vững', rest: ' — streak giúp bạn duy trì mỗi ngày không bỏ cuộc.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>{item.bold}</strong>{item.rest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── All Hubs Grid ─── */}
      <section className="py-16 sm:py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a2f]">12 Trung tâm quản lý</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Mọi khía cạnh cuộc sống, một ứng dụng duy nhất
          </h2>
          <p className="text-stone-600 text-sm">
            Từ sách vở, nhà cửa, tài chính cho đến thói quen & giải trí — tất cả đều có chỗ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {hubs.map((hub, i) => (
            <div key={i} className="rounded-2xl border border-[#e7e2d9] bg-white p-5 space-y-3 shadow-xs hover:shadow-md hover:border-[#1e3a2f]/20 transition-all duration-200">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${hub.color}`}>
                <hub.icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">{hub.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{hub.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Extra Features Strip ─── */}
      <section className="bg-[#f3eee7]/50 py-14 px-6 sm:px-12 border-y border-[#e7e2d9]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1e3a2f]">Và còn nhiều hơn nữa</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {extraFeatures.map((feat, i) => (
              <div key={i} className="text-center space-y-2 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a2f]/10 text-[#1e3a2f] mx-auto">
                  <feat.icon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-xs text-stone-800">{feat.title}</p>
                <p className="text-[10px] text-stone-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final Call to Action ─── */}
      <section className="bg-[#1e3a2f] text-white py-16 sm:py-20 px-6 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
          Bắt đầu tổ chức cuộc sống <br className="hidden sm:inline" />
          ngay hôm nay
        </h2>
        <p className="max-w-xl mx-auto text-emerald-100/80 text-sm leading-relaxed">
          Miễn phí, bảo mật & được thiết kế dành riêng cho người Việt. Chỉ cần một tài khoản để quản lý tất cả.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="bg-[#faf8f5] text-[#1e3a2f] hover:bg-white text-sm font-bold shadow-lg h-12 px-8">
              Tạo tài khoản HomeBase &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e2d9] bg-[#faf8f5] py-8 px-6 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} HomeBase — Trung Tâm Cuộc Sống.</p>
      </footer>
    </div>
  );
}
