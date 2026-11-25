'use client';

import React from 'react';
import { Coins, Fuel } from 'lucide-react';
import type { MorningFuelItem, MorningGoldData } from '@/app/api/morning/route';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVND } from '@/lib/utils';

interface MarketSnapshotCardsProps {
  gold: MorningGoldData | null | undefined;
  fuel: MorningFuelItem[];
  isLoading: boolean;
}

export function MarketSnapshotCards({ gold, fuel, isLoading }: MarketSnapshotCardsProps) {
  return (
    <div className="space-y-4">
      {/* Gold 9999 Card */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-subtle text-warning">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Vàng nhẫn trơn 9999</h2>
            <p className="text-[11px] text-text-muted">
              {gold?.source || 'PNJ TP.HCM'} • ĐVT: 1 chỉ
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : gold ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-md border border-border bg-background/60 p-3">
                <span className="text-[11px] text-text-muted block">Mua vào</span>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {formatVND(gold.buy)}
                </span>
              </div>
              <div className="rounded-md border border-border bg-background/60 p-3">
                <span className="text-[11px] text-text-muted block">Bán ra</span>
                <span className="text-base font-semibold text-warning tabular-nums">
                  {formatVND(gold.sell)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-text-muted flex items-center justify-between">
              <span>Quy đổi 1 lượng (10 chỉ):</span>
              <span className="font-medium text-foreground tabular-nums">
                {((gold.sell * 10) / 1_000_000).toFixed(2)} tr
              </span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-muted py-2">
            Chưa lấy được giá vàng nhẫn trơn 9999 lúc này.
          </p>
        )}
      </section>

      {/* Fuel Prices Card */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground border border-border">
            <Fuel className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Giá xăng dầu</h2>
            <p className="text-[11px] text-text-muted">Petrolimex • Vùng 1 (TP.HCM)</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
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
    </div>
  );
}
