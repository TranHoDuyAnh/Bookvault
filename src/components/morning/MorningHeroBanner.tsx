'use client';

import React, { useEffect, useState } from 'react';
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

function getHcmcTimeNumbers(): { h: number; m: number; s: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '8', 10);
  const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const s = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
  return { h: isNaN(h) ? 8 : h, m: isNaN(m) ? 0 : m, s: isNaN(s) ? 0 : s };
}

function HeroLiveClock({ fallbackTimeStr }: { fallbackTimeStr: string }) {
  const [clock, setClock] = useState<{ h: number; m: number; s: number } | null>(null);
  const [mode, setMode] = useState<'hybrid' | 'split'>('hybrid');

  useEffect(() => {
    const tick = () => setClock(getHcmcTimeNumbers());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = clock ? pad(clock.h) : fallbackTimeStr.slice(0, 2) || '08';
  const mm = clock ? pad(clock.m) : fallbackTimeStr.slice(3, 5) || '00';
  const ss = clock ? pad(clock.s) : '00';

  const secDeg = clock ? clock.s * 6 : 0;
  const minDeg = clock ? clock.m * 6 + clock.s * 0.1 : 0;
  const hourDeg = clock ? (clock.h % 12) * 30 + clock.m * 0.5 : 240;

  return (
    <button
      type="button"
      onClick={() => setMode((prev) => (prev === 'hybrid' ? 'split' : 'hybrid'))}
      title="Chạm để đổi kiểu đồng hồ"
      className="group shrink-0 text-left cursor-pointer focus:outline-none"
    >
      {mode === 'hybrid' ? (
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl px-4 py-3 shadow-lg transition-all group-hover:bg-black/40 group-hover:border-white/30">
          {/* Minimalist Analog Watch Dial */}
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full">
              <circle
                cx="32"
                cy="32"
                r="29"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.5"
              />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const isQuarter = i % 3 === 0;
                const r1 = isQuarter ? 22 : 24;
                const r2 = 26.5;
                return (
                  <line
                    key={i}
                    x1={32 + r1 * Math.sin(angle)}
                    y1={32 - r1 * Math.cos(angle)}
                    x2={32 + r2 * Math.sin(angle)}
                    y2={32 - r2 * Math.cos(angle)}
                    stroke={isQuarter ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'}
                    strokeWidth={isQuarter ? '1.8' : '1'}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Hour hand */}
              <line
                x1="32"
                y1="32"
                x2="32"
                y2="17"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                transform={`rotate(${hourDeg} 32 32)`}
              />
              {/* Minute hand */}
              <line
                x1="32"
                y1="32"
                x2="32"
                y2="12"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={`rotate(${minDeg} 32 32)`}
              />
              {/* Second hand */}
              <line
                x1="32"
                y1="36"
                x2="32"
                y2="10"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeLinecap="round"
                transform={`rotate(${secDeg} 32 32)`}
              />
              <circle cx="32" cy="32" r="2.2" fill="#fbbf24" />
            </svg>
          </div>

          {/* Digital Readout */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5 tabular-nums leading-none">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {hh}
                <span className="animate-pulse text-amber-300 mx-0.5">:</span>
                {mm}
              </span>
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-medium text-amber-200">
                {ss}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest text-white/65">
              <span>GMT+7 • SÀI GÒN</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Đổi kiểu</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-xl p-2 shadow-lg transition-all group-hover:bg-black/40 group-hover:border-white/30">
          {[hh, mm, ss].map((unit, idx) => (
            <React.Fragment key={idx}>
              <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner">
                <span
                  className={cn(
                    'text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight',
                    idx === 2 ? 'text-amber-300' : 'text-white'
                  )}
                >
                  {unit}
                </span>
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/25" />
              </div>
              {idx < 2 && (
                <span className="text-xl font-bold text-white/50 animate-pulse">:</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </button>
  );
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

        <HeroLiveClock fallbackTimeStr={timeStr} />
      </div>
    </section>
  );
}
