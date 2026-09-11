'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Flame,
  CheckCircle2,
  Heart,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bookmark,
  Utensils,
  Home,
  Gift,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { useTodayQuest } from '@/hooks/useMystery';
import { useFoodEntries } from '@/hooks/useFood';
import { useHomeItems } from '@/hooks/useHome';
import { BookCover } from '@/components/books/BookCover';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const { data: allBooks = [], isLoading: booksLoading } = useLibrary();

  // Lifestyle hooks
  const { data: todayQuest } = useTodayQuest();
  const { data: foodEntries = [] } = useFoodEntries({ sortBy: 'newest' });
  const { data: homeItems = [] } = useHomeItems();

  // Expiring warranties
  const expiringHomeItems = homeItems.filter((it) => {
    if (!it.warranty_end_date) return false;
    const today = new Date();
    const endDate = new Date(it.warranty_end_date);
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  // Greeting by hour of the day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'bạn';

  // Slices
  const currentlyReading = allBooks.filter((b) => b.status === 'READING');
  const recentlyAdded = [...allBooks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const recentlyRead = allBooks
    .filter((b) => b.status === 'READ')
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Chào mừng trở lại tủ sách số & không gian quản trị cuộc sống cá nhân của bạn.
        </p>
      </div>

      {/* Daily Mystery Box Banner Preview */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/10 via-[#FAF8F5] to-amber-500/10 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#1e3a2f] text-amber-300 shadow-md">
            <Gift className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" /> Nhiệm vụ Mystery Box hôm nay
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {todayQuest?.is_completed
                ? `Đã hoàn thành: "${todayQuest.quest?.title}" ✨`
                : todayQuest?.quest?.title || 'Khám phá thử thách bất ngờ của ngày hôm nay!'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
              {todayQuest?.quest?.description || 'Mở hộp quà để nhận nhiệm vụ trải nghiệm phong cách sống và nâng cao chuỗi streak.'}
            </p>
          </div>
        </div>

        <Link href="/app/mystery" className="flex-shrink-0 w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto gap-1.5 font-bold shadow-xs">
            {todayQuest?.is_completed ? 'Xem lại nhiệm vụ' : 'Mở hộp quà ngay 🎁'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Books */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng số sách</span>
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalBooks || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn trong tủ</span>
        </div>

        {/* Stat 2: Currently Reading */}
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đang đọc</span>
            <Flame className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.reading || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">đang theo dõi</span>
        </div>

        {/* Stat 3: Food Diary count */}
        <Link href="/app/food" className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1 hover:border-emerald-600/40 transition-colors">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Food Diary</span>
            <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {foodEntries.length}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">món ăn & quán ngon &rarr;</span>
        </Link>

        {/* Stat 4: Home Items count */}
        <Link href="/app/home" className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1 hover:border-blue-600/40 transition-colors">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Home Manager</span>
            <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
            {homeItems.length}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">thiết bị trong nhà &rarr;</span>
        </Link>
      </div>

      {/* Main Section: "Continue Reading" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#1e3a2f] dark:text-emerald-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Tiếp tục đọc
            </h2>
          </div>
          {currentlyReading.length > 0 && (
            <Link
              href="/app/reading"
              className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Xem tất cả ({currentlyReading.length}) &rarr;
            </Link>
          )}
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : currentlyReading.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dcd6ca] bg-white/60 dark:bg-stone-900/40 p-6 text-center text-xs text-stone-500 space-y-2">
            <p className="font-medium text-stone-700 dark:text-stone-300">
              Hiện tại bạn chưa đánh dấu cuốn sách nào là &quot;Đang đọc&quot;.
            </p>
            <p>Chọn một cuốn sách từ thư viện và cập nhật trạng thái để theo dõi tiến độ mỗi ngày!</p>
            <div className="pt-1">
              <Link href="/app/library">
                <Button size="sm" variant="outline" className="text-xs">
                  Khám phá tủ sách
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyReading.map((book) => {
              const primaryImage =
                book.images?.find((img) => img.is_primary)?.image_url ||
                book.images?.[0]?.image_url;

              return (
                <div
                  key={book.id}
                  className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs hover:border-[#1e3a2f]/40 transition-colors"
                >
                  <BookCover
                    src={primaryImage}
                    title={book.title}
                    author={book.author}
                    size="sm"
                    className="w-20 h-28 sm:w-24 sm:h-34 flex-shrink-0"
                  />

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        {book.author || 'Tác giả chưa rõ'}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                        <span>
                          {book.current_page} / {book.total_pages || '?'} trang
                        </span>
                        <span className="text-[#1e3a2f] dark:text-emerald-400">
                          {book.reading_progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-full rounded-full bg-[#1e3a2f] dark:bg-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link href={`/app/library/${book.id}`}>
                        <Button size="sm" className="w-full sm:w-auto text-xs gap-1.5 h-8">
                          <BookOpen className="h-3.5 w-3.5" />
                          Tiếp tục đọc &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lifestyle Preview Split: Food Favorites & Home Warranty Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Food Diary Snippet */}
        <div className="rounded-3xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-700" />
              Món ngon gần đây
            </h3>
            <Link href="/app/food" className="text-xs font-semibold text-emerald-700 hover:underline">
              Vào Food Diary &rarr;
            </Link>
          </div>

          {foodEntries.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-400">
              Chưa có món ăn nào được lưu. Hãy thử ghi lại bữa ăn hôm nay! 🍜
            </div>
          ) : (
            <div className="space-y-3">
              {foodEntries.slice(0, 3).map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">{f.dish_name}</p>
                    <p className="text-[11px] text-stone-500">{f.is_cooked_at_home ? '🏡 Tự nấu' : `🏬 ${f.restaurant_name || 'Quán ăn'}`}</p>
                  </div>
                  {f.price && (
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      {formatVND(f.price)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Home Manager Snippet */}
        <div className="rounded-3xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-700" />
              Thiết bị & Cảnh báo bảo hành
            </h3>
            <Link href="/app/home" className="text-xs font-semibold text-blue-700 hover:underline">
              Vào Home Manager &rarr;
            </Link>
          </div>

          {expiringHomeItems.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Có {expiringHomeItems.length} thiết bị sắp hết hạn bảo hành trong 30 ngày!</span>
              </div>
              {expiringHomeItems.slice(0, 2).map((it) => (
                <div key={it.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-100">
                  <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">{it.name}</span>
                  <span className="text-xs font-bold text-amber-700">Hết hạn: {it.warranty_end_date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-stone-400">
              Tất cả thiết bị đều trong trạng thái tốt và không có hạn bảo hành gấp. 🛡️
            </div>
          )}
        </div>
      </div>

      {/* Section: "Recently Added Books" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Mới thêm vào tủ sách
          </h2>
          <Link
            href="/app/library"
            className="text-xs font-semibold text-[#1e3a2f] dark:text-emerald-400 hover:underline"
          >
            Xem toàn bộ tủ sách &rarr;
          </Link>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
            ))}
          </div>
        ) : recentlyAdded.length === 0 ? (
          <EmptyState
            title="Tủ sách của bạn còn trống"
            description="Hãy bắt đầu thêm những cuốn sách đầu tiên bạn đang sở hữu."
            actionLabel="Thêm sách mới"
            onAction={() => {
              const addBtn = document.querySelector('header button');
              if (addBtn instanceof HTMLElement) addBtn.click();
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recentlyAdded.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
