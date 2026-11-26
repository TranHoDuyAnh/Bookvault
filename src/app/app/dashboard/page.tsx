'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Wrench,
} from 'lucide-react';
import type { MorningBriefResponse } from '@/app/api/morning/route';
import { getHcmcPeriodMeta, getHcmcQuoteDayInfo, getLunarDateInfo } from '@/lib/lunar';
import { evaluateMaintenanceItem, formatDueCountdown } from '@/lib/maintenance';
import { useUser } from '@/hooks/useUser';
import { useLibrary, useLibraryStats } from '@/hooks/useLibrary';
import { useMaintenanceItems } from '@/hooks/useMaintenance';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { MorningHeroBanner } from '@/components/morning/MorningHeroBanner';
import { DailyQuoteCard } from '@/components/morning/DailyQuoteCard';
import { HcmcWeatherCard } from '@/components/morning/HcmcWeatherCard';
import { MarketSnapshotCards } from '@/components/morning/MarketSnapshotCards';
import { HabitCheckinBentoCard } from '@/components/morning/HabitCheckinBentoCard';
import { UpcomingDatesBentoCard } from '@/components/morning/UpcomingDatesBentoCard';
import { CurrentlyReadingBentoCard } from '@/components/morning/CurrentlyReadingBentoCard';

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
  const { data: maintenanceItems = [] } = useMaintenanceItems();

  const dueMaintenance = useMemo(() => {
    return maintenanceItems
      .map((item) => evaluateMaintenanceItem(item))
      .filter((e) => e.urgency === 'OVERDUE' || e.urgency === 'DUE_SOON')
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 4);
  }, [maintenanceItems]);

  const [now, setNow] = useState<Date>(() => new Date());
  const [photoOffset, setPhotoOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const { timeStr, dateStr, hourNum, dayOfYear } = useMemo(() => getHcmcClockParts(now), [now]);
  const periodMeta = useMemo(() => getHcmcPeriodMeta(hourNum), [hourNum]);
  const lunar = useMemo(() => getLunarDateInfo(now), [now]);
  const { dayKey: quoteDayKey } = useMemo(() => getHcmcQuoteDayInfo(now), [now]);

  const {
    data: morningData,
    isLoading: morningLoading,
    isFetching: morningFetching,
    refetch: refetchMorning,
  } = useQuery<MorningBriefResponse>({
    queryKey: ['morning-brief', periodMeta.period, quoteDayKey],
    queryFn: async () => {
      const res = await fetch(
        `/api/morning?period=${periodMeta.period}&quoteDay=${quoteDayKey}`
      );
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
  const readCount = allBooks.filter((b) => b.status === 'READ').length;

  return (
    <div className="space-y-6">
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

      {/* Bento Row 1: Weather + Sparkline (Left 7 cols) | Quote + Habit Check-in (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <HcmcWeatherCard weather={morningData?.weather} isLoading={morningLoading} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <DailyQuoteCard quote={morningData?.quote} isLoading={morningLoading} />
          <HabitCheckinBentoCard className="flex-1" />
        </div>
      </div>

      {/* Bento Row 2: Currently Reading (5 cols) | Upcoming Dates (4 cols) | Compact Market Tab Card (3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <CurrentlyReadingBentoCard books={currentlyReading} isLoading={booksLoading} />
        </div>
        <div className="lg:col-span-4">
          <UpcomingDatesBentoCard />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <MarketSnapshotCards
            gold={morningData?.gold}
            fuel={morningData?.fuel || []}
            isLoading={morningLoading}
          />
        </div>
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

      {/* Life Maintenance Attention Widget */}
      {dueMaintenance.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-text-secondary" />
              <h2 className="text-sm font-semibold text-foreground">
                Bảo trì cuộc sống cần chú ý
              </h2>
            </div>
            <Link
              href="/app/maintenance"
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-foreground transition-colors"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dueMaintenance.map((e) => (
              <Link
                key={e.item.id}
                href="/app/maintenance"
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/35 px-3.5 py-2.5 hover:bg-accent/60 transition-colors"
              >
                <span className="text-sm font-medium text-foreground truncate">
                  {e.item.title}
                </span>
                <Badge
                  variant={e.urgency === 'OVERDUE' ? 'destructive' : 'warning'}
                  className="shrink-0"
                >
                  {formatDueCountdown(e.daysUntilDue, e.isOdoDue)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
