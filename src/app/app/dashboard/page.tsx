'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  CalendarHeart,
  Tv,
  ArrowRight,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { BookCard } from '@/components/books/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
  const { user, profile } = useUser();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const { data: allBooks = [], isLoading: booksLoading } = useLibrary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'bạn';

  const currentlyReading = allBooks.filter((b) => b.status === 'READING');
  const recentlyAdded = [...allBooks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const readCount = allBooks.filter((b) => b.status === 'READ').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${getGreeting()}, ${displayName}`}
        description="Tổng quan tủ sách và không gian quản lý cá nhân của bạn."
      />

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Tổng số sách"
          value={stats?.totalBooks || 0}
          hint="cuốn trong tủ"
          icon={<BookOpen className="h-4 w-4" />}
          href="/app/library"
          isLoading={statsLoading}
        />

        <StatCard
          label="Đang đọc"
          value={currentlyReading.length}
          hint="cuốn đang theo dõi"
          icon={<Flame className="h-4 w-4" />}
          href="/app/library"
          isLoading={booksLoading}
        />

        <StatCard
          label="Đã đọc xong"
          value={readCount}
          hint="cuốn đã hoàn thành"
          icon={<CheckCircle2 className="h-4 w-4" />}
          href="/app/library"
          isLoading={booksLoading}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Quick Links to Lifestyle Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/app/entertainment"
          className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-ring/50 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground border border-border">
              <Tv className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">
                Giải trí & Văn hoá
              </h3>
              <p className="text-xs text-text-muted truncate">
                Phim, Anime, Game, Podcast đang theo dõi
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <Link
          href="/app/dates"
          className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs hover:border-ring/50 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground border border-border">
              <CalendarHeart className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">
                Ngày quan trọng
              </h3>
              <p className="text-xs text-text-muted truncate">
                Sinh nhật, kỷ niệm & sự kiện nhắc lịch
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>

      {/* Section: Recently Added Books */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Mới thêm vào tủ sách
          </h2>
          <Link
            href="/app/library"
            className="text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
          >
            Xem toàn bộ &rarr;
          </Link>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyAdded.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
