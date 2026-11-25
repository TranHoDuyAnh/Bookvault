'use client';

import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Gauge, MapPin, Star } from 'lucide-react';
import { useMaintenanceLogs } from '@/hooks/useMaintenance';
import type { MaintenanceItem } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';

interface MaintenanceHistoryModalProps {
  item: MaintenanceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MaintenanceHistoryModal({
  item,
  isOpen,
  onClose,
}: MaintenanceHistoryModalProps) {
  const { data: logs = [], isLoading } = useMaintenanceLogs(item?.id);

  if (!item) return null;

  const totalCost = logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lịch sử: ${item.title}`}
      description={`Tổng ${logs.length} lần thực hiện • Tổng chi phí: ${formatCurrency(
        totalCost
      )}`}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-text-muted">
          Chưa có lịch sử thực hiện nào cho mục này.
        </div>
      ) : (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {logs.map((log) => {
            const parsed = parseISO(log.done_at);
            const dateLabel = isValid(parsed)
              ? format(parsed, 'dd/MM/yyyy', { locale: vi })
              : log.done_at;

            return (
              <div
                key={log.id}
                className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {dateLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {log.rating && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {log.rating}/5
                      </span>
                    )}
                    {log.cost !== null && (
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {formatCurrency(Number(log.cost))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  {log.provider_name && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.provider_name}
                    </span>
                  )}
                  {log.odo_at_done !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {log.odo_at_done.toLocaleString('vi-VN')} km
                    </span>
                  )}
                </div>

                {log.notes && (
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {log.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
