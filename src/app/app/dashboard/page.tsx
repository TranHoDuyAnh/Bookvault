'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  CalendarHeart,
  Tv,
  ArrowRight,
} from 'lucide-react';
import type { MorningBriefResponse } from '@/app/api/morning/route';
import { getHcmcPeriodMeta, getLunarDateInfo } from '@/lib/lunar';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { BookCard } from '@/components/books/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { MorningHeroBanner } from '@/components/morning/MorningHeroBanner';
import { HcmcWeatherCard } from '@/components/morning/HcmcWeatherCard';
import { MarketSnapshotCards } from '@/components/morning/MarketSnapshotCards';

const PERIOD_INDEX_MAP: Record<string, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
  night: 3,
};

function getHcmcClockParts(now: Date) {
  const timeStr = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const dateStr = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);

  const hourNum = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hour12: false,
    }).format(now),
    10
  );

  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { timeStr, dateStr, hourNum: isNaN(hourNum) ? 8 : hourNum, dayOfYear };
}

export default function DashboardPage() {
  const { user, profile } = useUser();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const { data: allBooks = [], isLoading: booksLoading } = useLibrary();

  const [now, setNow] = useState<Date>(() => new Date());
  const [photoOffset, setPhotoOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const { timeStr, dateStr, hourNum, dayOfYear } = useMemo(() => getHcmcClockParts(now), [now]);
  const periodMeta = useMemo(() => getHcmcPeriodMeta(hourNum), [hourNum]);
  const lunar = useMemo(() => getLunarDateInfo(now), [now]);

  const {
    data: morningData,
    isLoading: morningLoading,
    isFetching: morningFetching,
    refetch: refetchMorning,
  } = useQuery<MorningBriefResponse>({
    queryKey: ['morning-brief', periodMeta.period],
    queryFn: async () => {
      const res = await fetch(`/api/morning?period=${periodMeta.period}`);
      if (!res.ok) throw new Error('Không thể tải bản tin.');
      return res.json();
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const photos = useMemo(() => morningData?.photos || [], [morningData?.photos]);
  const activePhoto = useMemo(() => {
    if (photos.length === 0) return null;
    const baseIdx = dayOfYear + (PERIOD_INDEX_MAP[periodMeta.period] ?? 0) + photoOffset;
    return photos[Math.abs(baseIdx) % photos.length];
  }, [photos, dayOfYear, periodMeta.period, photoOffset]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'bạn';
  const currentlyReading = allBooks.filter((b) => b.status === 'READING');
  const recentlyAdded = [...allBooks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const readCount = allBooks.filter((b) => b.status === 'READ').length;

  return (
    <div className="space-y-8">
      {/* Daily + Time-of-Day Hero Banner */}
      <MorningHeroBanner
        periodMeta={periodMeta}
        lunar={lunar}
        activePhoto={activePhoto}
        hasMultiplePhotos={photos.length > 1}
        onNextPhoto={() => setPhotoOffset((prev) => prev + 1)}
        onRefresh={() => refetchMorning()}
        isFetching={morningFetching}
        dateStr={dateStr}
        timeStr={timeStr}
        displayName={displayName}
      />

      {/* HCMC Weather, Gold 9999 & Fuel Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HcmcWeatherCard weather={morningData?.weather} isLoading={morningLoading} />
        <MarketSnapshotCards
          gold={morningData?.gold}
          fuel={morningData?.fuel || []}
          isLoading={morningLoading}
        />
      </div>

      {/* Book Statistics Row */}
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
