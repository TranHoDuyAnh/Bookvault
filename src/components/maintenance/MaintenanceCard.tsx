'use client';

import React from 'react';
import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Gauge,
  History,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CATEGORY_MAP,
  formatDueCountdown,
  formatRecurrenceLabel,
  type EvaluatedMaintenanceItem,
} from '@/lib/maintenance';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from './CategoryIcon';

interface MaintenanceCardProps {
  evaluated: EvaluatedMaintenanceItem;
  onComplete: () => void;
  onSnooze: (days: number) => void;
  onEdit: () => void;
  onHistory: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isBusy?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateVi(isoDate: string | null) {
  if (!isoDate) return 'Chưa có';
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) return isoDate;
  return format(parsed, 'dd/MM/yyyy', { locale: vi });
}

export function MaintenanceCard({
  evaluated,
  onComplete,
  onSnooze,
  onEdit,
  onHistory,
  onToggleActive,
  onDelete,
  isBusy = false,
}: MaintenanceCardProps) {
  const { item, urgency, daysUntilDue, kmRemaining, isOdoDue } = evaluated;
  const catMeta = CATEGORY_MAP[item.category] ?? CATEGORY_MAP.OTHER;

  const urgencyStyles = {
    OVERDUE: {
      strip: 'bg-destructive',
      cardBorder: 'border-destructive/35 hover:border-destructive/55',
      badgeVariant: 'destructive' as const,
      progressBar: 'bg-destructive',
    },
    DUE_SOON: {
      strip: 'bg-warning',
      cardBorder: 'border-warning/35 hover:border-warning/55',
      badgeVariant: 'warning' as const,
      progressBar: 'bg-warning',
    },
    SNOOZED: {
      strip: 'bg-info',
      cardBorder: 'border-info/30 hover:border-info/50',
      badgeVariant: 'info' as const,
      progressBar: 'bg-info',
    },
    UPCOMING: {
      strip: 'bg-success/70',
      cardBorder: 'border-border hover:border-ring/50',
      badgeVariant: 'success' as const,
      progressBar: 'bg-success',
    },
    PAUSED: {
      strip: 'bg-muted-foreground/40',
      cardBorder: 'border-border opacity-75',
      badgeVariant: 'secondary' as const,
      progressBar: 'bg-muted-foreground/40',
    },
  }[urgency];

  // Cycle progress percentage between last_done_at and next_due_at
  let cyclePercent = 0;
  if (item.last_done_at) {
    const last = parseISO(item.last_done_at);
    const next = parseISO(item.next_due_at);
    if (isValid(last) && isValid(next)) {
      const totalSpan = Math.max(1, differenceInCalendarDays(next, last));
      const elapsed = differenceInCalendarDays(new Date(), last);
      cyclePercent = Math.min(100, Math.max(4, Math.round((elapsed / totalSpan) * 100)));
    }
  } else if (urgency === 'OVERDUE') {
    cyclePercent = 100;
  } else if (urgency === 'DUE_SOON') {
    cyclePercent = 82;
  } else {
    cyclePercent = 25;
  }

  const countdownLabel =
    urgency === 'PAUSED'
      ? 'Đang tạm ngưng'
      : urgency === 'SNOOZED'
      ? `Hoãn đến ${formatDateVi(item.snoozed_until)}`
      : formatDueCountdown(daysUntilDue, isOdoDue);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card backdrop-blur-xl text-card-foreground shadow-[var(--glass-shadow)] transition-all duration-150 flex flex-col justify-between',
        urgencyStyles.cardBorder
      )}
    >
      {/* Left accent strip */}
      <div
        className={cn('absolute inset-y-0 left-0 w-1', urgencyStyles.strip)}
        aria-hidden="true"
      />

      <div className="p-4 sm:p-5 pl-5 sm:pl-6 space-y-3.5">
        {/* Top Row: Category Icon + Title + Countdown Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                catMeta.accentBg,
                catMeta.accentText,
                catMeta.accentBorder
              )}
            >
              <CategoryIcon category={item.category} className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="text-[15px] font-semibold leading-snug text-foreground truncate">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                <span className={cn('font-medium', catMeta.accentText)}>
                  {catMeta.shortLabel}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  {formatRecurrenceLabel(item)}
                </span>
              </div>
            </div>
          </div>

          <Badge variant={urgencyStyles.badgeVariant} className="shrink-0">
            {countdownLabel}
          </Badge>
        </div>

        {/* Cycle Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>
              Lần cuối:{' '}
              <strong className="font-medium text-text-secondary">
                {formatDateVi(item.last_done_at)}
              </strong>
            </span>
            <span>
              Hạn tới:{' '}
              <strong className="font-medium text-foreground">
                {formatDateVi(item.next_due_at)}
              </strong>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                urgencyStyles.progressBar
              )}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
        </div>

        {/* Metadata Chips (Vehicle Odo, Provider, Cost, Auto-renew) */}
        {(item.vehicle_name ||
          kmRemaining !== null ||
          item.provider_name ||
          item.estimated_cost ||
          item.auto_renew ||
          item.notes) && (
          <div className="space-y-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              {item.vehicle_name && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">
                  {item.vehicle_name}
                </span>
              )}
              {kmRemaining !== null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium',
                    kmRemaining <= 0
                      ? 'bg-destructive-subtle text-destructive'
                      : kmRemaining <= 200
                      ? 'bg-warning-subtle text-warning'
                      : 'bg-secondary text-text-secondary'
                  )}
                >
                  <Gauge className="h-3 w-3" />
                  {kmRemaining <= 0
                    ? `Vượt ${Math.abs(kmRemaining).toLocaleString('vi-VN')} km`
                    : `Còn ${kmRemaining.toLocaleString('vi-VN')} km`}
                </span>
              )}
              {item.provider_name && (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <MapPin className="h-3 w-3" />
                  {item.provider_name}
                </span>
              )}
              {item.estimated_cost !== null && item.estimated_cost > 0 && (
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium tabular-nums">
                  ~{formatCurrency(item.estimated_cost)}
                </span>
              )}
              {item.auto_renew && (
                <Badge variant="outline" className="text-[10px] py-0 px-2">
                  Tự động gia hạn
                </Badge>
              )}
            </div>
            {item.notes && (
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                {item.notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Quick Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-secondary/30 px-4 sm:px-5 pl-5 sm:pl-6 py-2.5">
        <div className="flex items-center gap-1.5">
          {item.is_active && (
            <>
              <Button
                type="button"
                size="sm"
                variant={
                  urgency === 'OVERDUE' || urgency === 'DUE_SOON'
                    ? 'default'
                    : 'outline'
                }
                onClick={onComplete}
                disabled={isBusy}
                className="h-8 px-2.5 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã làm
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onSnooze(3)}
                disabled={isBusy}
                className="h-8 px-2.5 text-xs text-text-muted hover:text-foreground"
                title="Hoãn nhắc lại sau 3 ngày"
              >
                <Clock className="h-3.5 w-3.5" />
                +3 ngày
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onHistory}
            className="rounded-md p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Xem lịch sử"
            aria-label="Xem lịch sử"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleActive}
            className="rounded-md p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title={item.is_active ? 'Tạm ngưng nhắc' : 'Kích hoạt lại'}
            aria-label={item.is_active ? 'Tạm ngưng nhắc' : 'Kích hoạt lại'}
          >
            {item.is_active ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1.5 text-text-muted hover:bg-destructive-subtle hover:text-destructive transition-colors cursor-pointer"
            title="Xóa mục"
            aria-label="Xóa mục"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
