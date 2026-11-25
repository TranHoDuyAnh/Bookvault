'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MorningBriefResponse } from '@/app/api/morning/route';
import { getHcmcPeriodMeta, getLunarDateInfo } from '@/lib/lunar';
import { useUser } from '@/hooks/useUser';
import { useUpcomingDates } from '@/hooks/useImportantDates';
import { useMediaEntries } from '@/hooks/useEntertainment';
import { MorningHeroBanner } from '@/components/morning/MorningHeroBanner';
import { HcmcWeatherCard } from '@/components/morning/HcmcWeatherCard';
import { MarketSnapshotCards } from '@/components/morning/MarketSnapshotCards';
import { HomeBaseContextRow } from '@/components/morning/HomeBaseContextRow';

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

export default function MorningBriefPage() {
  const { user, profile } = useUser();
  const [now, setNow] = useState<Date>(() => new Date());
  const [photoOffset, setPhotoOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const { timeStr, dateStr, hourNum, dayOfYear } = useMemo(() => getHcmcClockParts(now), [now]);
  const periodMeta = useMemo(() => getHcmcPeriodMeta(hourNum), [hourNum]);
  const lunar = useMemo(() => getLunarDateInfo(now), [now]);

  const { data, isLoading, isFetching, refetch } = useQuery<MorningBriefResponse>({
    queryKey: ['morning-brief', periodMeta.period],
    queryFn: async () => {
      const res = await fetch(`/api/morning?period=${periodMeta.period}`);
      if (!res.ok) throw new Error('Không thể tải bản tin.');
      return res.json();
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: upcomingDates = [] } = useUpcomingDates(14);
  const { data: inProgressMedia = [] } = useMediaEntries({ status: 'IN_PROGRESS' });

  const photos = useMemo(() => data?.photos || [], [data?.photos]);
  const activePhoto = useMemo(() => {
    if (photos.length === 0) return null;
    const baseIdx = dayOfYear + (PERIOD_INDEX_MAP[periodMeta.period] ?? 0) + photoOffset;
    return photos[Math.abs(baseIdx) % photos.length];
  }, [photos, dayOfYear, periodMeta.period, photoOffset]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'bạn';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <MorningHeroBanner
        periodMeta={periodMeta}
        lunar={lunar}
        activePhoto={activePhoto}
        hasMultiplePhotos={photos.length > 1}
        onNextPhoto={() => setPhotoOffset((prev) => prev + 1)}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        dateStr={dateStr}
        timeStr={timeStr}
        displayName={displayName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HcmcWeatherCard weather={data?.weather} isLoading={isLoading} />
        <MarketSnapshotCards
          gold={data?.gold}
          fuel={data?.fuel || []}
          isLoading={isLoading}
        />
      </div>

      <HomeBaseContextRow
        upcomingDates={upcomingDates}
        inProgressMedia={inProgressMedia}
      />
    </div>
  );
}
