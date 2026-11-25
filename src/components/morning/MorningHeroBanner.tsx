'use client';

import React from 'react';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  MapPin,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import type { MorningPhotoItem } from '@/app/api/morning/route';
import type { LunarDateInfo, PeriodMeta } from '@/lib/lunar';
import { cn } from '@/lib/utils';

interface MorningHeroBannerProps {
  periodMeta: PeriodMeta;
  lunar: LunarDateInfo;
  activePhoto: MorningPhotoItem | null;
  hasMultiplePhotos: boolean;
  onNextPhoto: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  dateStr: string;
  timeStr: string;
  displayName: string;
}

function PeriodIcon({ period, className }: { period: string; className?: string }) {
  if (period === 'morning') return <Sunrise className={className} />;
  if (period === 'afternoon') return <Sun className={className} />;
  if (period === 'evening') return <Sunset className={className} />;
  return <Moon className={className} />;
}

export function MorningHeroBanner({
  periodMeta,
  lunar,
  activePhoto,
  hasMultiplePhotos,
  onNextPhoto,
  onRefresh,
  isFetching,
  dateStr,
  timeStr,
  displayName,
}: MorningHeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-zinc-900 text-white min-h-[280px] sm:min-h-[320px] flex flex-col justify-between shadow-sm">
      {activePhoto && (
        <img
          src={activePhoto.url}
          alt={activePhoto.title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500"
        />
      )}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-colors duration-500',
          periodMeta.gradientClass
        )}
      />

      {/* Top Bar inside Hero */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-medium text-white">
            <PeriodIcon period={periodMeta.period} className="h-3.5 w-3.5" />
            {periodMeta.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-medium text-white">
            <MapPin className="h-3.5 w-3.5" />
            TP. Hồ Chí Minh
          </span>
          {lunar.isSpecialDay && lunar.specialLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/25 backdrop-blur-md border border-amber-300/40 px-3 py-1 text-xs font-medium text-amber-100">
              <Sparkles className="h-3 w-3" />
              {lunar.specialLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasMultiplePhotos && (
            <button
              type="button"
              onClick={onNextPhoto}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
              title="Đổi ảnh nền khác"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Đổi ảnh</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-60"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 p-5 sm:p-7 pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm sm:text-base font-medium text-white/85 capitalize">
            {dateStr} • {lunar.formatted}
          </p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
            {periodMeta.greeting}, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl">
            {periodMeta.subtitle}
          </p>
        </div>

        <div className="sm:text-right shrink-0">
          <div className="text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums text-white leading-none">
            {timeStr}
          </div>
          {activePhoto?.copyright && (
            <p className="text-[11px] text-white/65 mt-2 max-w-xs sm:ml-auto truncate">
              {activePhoto.copyright}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
