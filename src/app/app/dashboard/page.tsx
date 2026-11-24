'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BookMarked,
  CheckCircle2,
  Flame,
  CalendarHeart,
  Tv,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { BookCard } from '@/components/books/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function DashboardPage() {
  const { user, profile } = useUser();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const { data: allBooks = [], isLoading: booksLoading } = useLibrary();

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
  const readCount = allBooks.filter((b) => b.status === 'READ').length;

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

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Stat 1: Total Books */}
        <Link href="/app/library" className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1 hover:border-[#1e3a2f]/40 transition-colors">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng số sách</span>
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalBooks || 0}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn trong tủ &rarr;</span>
        </Link>

        {/* Stat 2: Currently Reading */}
        <Link href="/app/library" className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1 hover:border-blue-600/40 transition-colors">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đang đọc</span>
            <Flame className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400">
            {booksLoading ? <Skeleton className="h-8 w-16" /> : currentlyReading.length}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn đang theo dõi &rarr;</span>
        </Link>

        {/* Stat 3: Read Books */}
        <Link href="/app/library" className="col-span-2 sm:col-span-1 rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-2xs space-y-1 hover:border-emerald-600/40 transition-colors">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Đã đọc xong</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {booksLoading ? <Skeleton className="h-8 w-16" /> : readCount}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">cuốn đã hoàn thành &rarr;</span>
        </Link>
      </div>

      {/* Quick Links to Remaining Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/app/entertainment" className="flex items-center justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:border-rose-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">Giải trí & Văn hoá</h3>
              <p className="text-xs text-stone-500">Phim, Anime, Game, Podcast đang theo dõi</p>
            </div>
          </div>
          <BookMarked className="h-4 w-4 text-stone-400" />
        </Link>

        <Link href="/app/dates" className="flex items-center justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:border-pink-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">Ngày quan trọng</h3>
              <p className="text-xs text-stone-500">Sinh nhật, kỷ niệm & sự kiện nhắc lịch</p>
            </div>
          </div>
          <BookMarked className="h-4 w-4 text-stone-400" />
        </Link>
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
