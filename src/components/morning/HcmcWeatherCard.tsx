'use client';

import React from 'react';
import {
  Sun,
  Sunset,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSun,
  Droplets,
  Wind,
  Umbrella,
} from 'lucide-react';
import type { MorningWeatherData } from '@/app/api/morning/route';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

function WeatherCodeIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />;
  if (code === 1 || code === 2) return <CloudSun className={className} />;
  if (code === 3 || code === 45 || code === 48) return <Cloud className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  if (code >= 51) return <CloudRain className={className} />;
  return <CloudSun className={className} />;
}

function getAqiBadgeStyle(aqi: number | null): string {
  if (aqi === null) return 'bg-secondary text-text-muted border-border';
  if (aqi <= 50) return 'bg-success-subtle text-success border-success/25';
  if (aqi <= 100) return 'bg-warning-subtle text-warning border-warning/25';
  return 'bg-destructive-subtle text-destructive border-destructive/25';
}

interface HcmcWeatherCardProps {
  weather: MorningWeatherData | null | undefined;
  isLoading: boolean;
}

export function HcmcWeatherCard({ weather, isLoading }: HcmcWeatherCardProps) {
  return (
    <section className="lg:col-span-2 rounded-lg border border-border bg-card p-5 shadow-2xs flex flex-col justify-between gap-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : weather ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary border border-border text-foreground shrink-0">
                <WeatherCodeIcon code={weather.weatherCode} className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                    {weather.temperature}°C
                  </span>
                  <span className="text-sm font-medium text-text-secondary">
                    {weather.weatherLabel}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Cảm giác như {weather.apparentTemperature}°C
                  {weather.tempMin !== null && weather.tempMax !== null
                    ? ` • Thấp/Cao: ${weather.tempMin}° / ${weather.tempMax}°C`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
                  getAqiBadgeStyle(weather.aqi)
                )}
              >
                AQI {weather.aqi ?? '—'} • {weather.aqiLabel}
              </span>
            </div>
          </div>

          {/* Practical Advice Banner */}
          <div className="flex items-start gap-2.5 rounded-md bg-secondary/70 border border-border px-3.5 py-2.5 text-xs sm:text-sm text-foreground">
            <Umbrella className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
            <span>{weather.advice}</span>
          </div>

          {/* Secondary Weather Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-md border border-border bg-background/60 px-3 py-2 flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 text-info shrink-0" />
              <div>
                <span className="text-text-muted block">Độ ẩm</span>
                <span className="font-semibold text-foreground">{weather.humidity}%</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/60 px-3 py-2 flex items-center gap-2">
              <Wind className="h-3.5 w-3.5 text-text-secondary shrink-0" />
              <div>
                <span className="text-text-muted block">Gió</span>
                <span className="font-semibold text-foreground">{weather.windSpeed} km/h</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/60 px-3 py-2 flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-warning shrink-0" />
              <div>
                <span className="text-text-muted block">UV tối đa</span>
                <span className="font-semibold text-foreground">
                  {weather.uvIndexMax !== null ? weather.uvIndexMax : '—'}
                </span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/60 px-3 py-2 flex items-center gap-2">
              <Sunset className="h-3.5 w-3.5 text-warning shrink-0" />
              <div>
                <span className="text-text-muted block">Mặt trời</span>
                <span className="font-semibold text-foreground">
                  {weather.sunrise || '—'} / {weather.sunset || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 8-Hour Forecast Strip */}
          {weather.hourly.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-medium text-text-muted mb-2 uppercase tracking-wider">
                Dự báo theo giờ tại TP.HCM
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {weather.hourly.map((h) => (
                  <div
                    key={h.time}
                    className="flex flex-col items-center rounded-md border border-border bg-background/50 py-2 px-1 text-center"
                  >
                    <span className="text-[11px] text-text-muted tabular-nums">
                      {h.hourLabel}
                    </span>
                    <WeatherCodeIcon
                      code={h.weatherCode}
                      className="h-4 w-4 text-foreground my-1"
                    />
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {h.temperature}°
                    </span>
                    <span className="text-[10px] text-info tabular-nums mt-0.5">
                      {h.precipitationProbability}% mưa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-sm text-text-muted">
          Không thể tải dữ liệu thời tiết TP.HCM lúc này.
        </div>
      )}
    </section>
  );
}
