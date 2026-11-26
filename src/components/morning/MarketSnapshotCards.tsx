'use client';

import React, { useState } from 'react';
import { Coins, Fuel } from 'lucide-react';
import type { MorningFuelItem, MorningGoldData } from '@/app/api/morning/route';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatVND } from '@/lib/utils';

interface MarketSnapshotCardsProps {
  gold: MorningGoldData | null | undefined;
  fuel: MorningFuelItem[];
  isLoading: boolean;
  className?: string;
}

type MarketTab = 'gold' | 'fuel';

export function MarketSnapshotCards({
  gold,
  fuel,
  isLoading,
  className,
}: MarketSnapshotCardsProps) {
  const [activeTab, setActiveTab] = useState<MarketTab>('gold');

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between gap-4 h-full',
        className
      )}
    >
      {/* Header + Compact Tab Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
              activeTab === 'gold'
                ? 'bg-warning-subtle text-warning border-warning/25'
                : 'bg-secondary text-foreground border-border'
            )}
          >
            {activeTab === 'gold' ? (
              <Coins className="h-4 w-4" />
            ) : (
              <Fuel className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {activeTab === 'gold' ? 'Vàng nhẫn 9999' : 'Giá xăng dầu'}
            </h2>
            <p className="text-[11px] text-text-muted truncate">
              {activeTab === 'gold'
                ? `${gold?.source || 'PNJ TP.HCM'} • 1 chỉ`
                : 'Petrolimex • Vùng 1'}
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-secondary/70 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('gold')}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              activeTab === 'gold'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-text-muted hover:text-foreground'
            )}
          >
            Vàng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fuel')}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
              activeTab === 'fuel'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-text-muted hover:text-foreground'
            )}
          >
            Xăng
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : activeTab === 'gold' ? (
        gold ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <span className="text-[11px] text-text-muted block">Mua vào</span>
                <span className="text-sm sm:text-base font-semibold text-foreground tabular-nums">
                  {formatVND(gold.buy)}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-3">
                <span className="text-[11px] text-text-muted block">Bán ra</span>
                <span className="text-sm sm:text-base font-semibold text-warning tabular-nums">
                  {formatVND(gold.sell)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-text-muted flex items-center justify-between pt-0.5">
              <span>Quy đổi 1 lượng (10 chỉ):</span>
              <span className="font-semibold text-foreground tabular-nums">
                {((gold.sell * 10) / 1_000_000).toFixed(2)} tr
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-muted py-2">
            Chưa lấy được giá vàng nhẫn trơn 9999 lúc này.
          </p>
        )
      ) : fuel.length > 0 ? (
        <div className="divide-y divide-border">
          {fuel.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs"
            >
              <span className="text-text-secondary truncate pr-2">{item.name}</span>
              <span className="font-semibold text-foreground tabular-nums shrink-0">
                {formatVND(item.zone1Price)}
                <span className="text-[10px] font-normal text-text-muted">/lít</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted py-2">
          Chưa lấy được bảng giá xăng dầu lúc này.
        </p>
      )}
    </section>
  );
}
