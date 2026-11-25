'use client';

import React, { useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarCheck2, Star } from 'lucide-react';
import { computeNextDueDate, toISODate } from '@/lib/maintenance';
import type { MaintenanceItem } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface CompleteMaintenanceModalProps {
  item: MaintenanceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    doneAt: string;
    cost: number | null;
    odoAtDone: number | null;
    providerName: string | null;
    rating: number | null;
    notes: string | null;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function CompleteMaintenanceModal({
  item,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CompleteMaintenanceModalProps) {
  const [doneAt, setDoneAt] = useState(() => toISODate(new Date()));
  const [cost, setCost] = useState(() =>
    item?.estimated_cost ? String(item.estimated_cost) : ''
  );
  const [odoAtDone, setOdoAtDone] = useState(() =>
    item?.current_odo ? String(item.current_odo) : ''
  );
  const [providerName, setProviderName] = useState(
    () => item?.provider_name || ''
  );
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const previewNextDue = useMemo(() => {
    if (!item || !doneAt) return '';
    const nextIso = computeNextDueDate({
      recurrenceMode: item.recurrence_mode,
      intervalValue: item.interval_value,
      intervalUnit: item.interval_unit,
      doneAt,
      currentDueAt: item.next_due_at,
    });
    const parsed = parseISO(nextIso);
    return isValid(parsed)
      ? format(parsed, 'dd/MM/yyyy', { locale: vi })
      : nextIso;
  }, [item, doneAt]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      doneAt,
      cost: cost.trim() ? Number(cost) : null,
      odoAtDone: odoAtDone.trim() ? Number(odoAtDone) : null,
      providerName: providerName.trim() || null,
      rating,
      notes: notes.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hoàn thành: ${item.title}`}
      description="Ghi nhận lần thực hiện này và tự động lên lịch cho chu kỳ tiếp theo."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Ngày thực hiện
            </label>
            <Input
              type="date"
              value={doneAt}
              onChange={(e) => setDoneAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Chi phí thực tế (₫)
            </label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Ví dụ: 150000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        {(item.category === 'VEHICLE' || item.recurrence_mode === 'USAGE_BASED') && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Số Odo lúc bảo dưỡng (km)
            </label>
            <Input
              type="number"
              min={0}
              placeholder="Ví dụ: 18500"
              value={odoAtDone}
              onChange={(e) => setOdoAtDone(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Tiệm / Nơi thực hiện
          </label>
          <Input
            placeholder="Ví dụ: Barber 30Shine, Head Honda..."
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Đánh giá trải nghiệm
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded hover:bg-accent transition-colors cursor-pointer"
                aria-label={`${star} sao`}
              >
                <Star
                  className={
                    star <= rating
                      ? 'h-5 w-5 fill-amber-400 text-amber-400'
                      : 'h-5 w-5 text-text-disabled'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Ghi chú thêm
          </label>
          <Textarea
            rows={2}
            placeholder="Thay nhớt Motul, thợ tên Hùng cắt đẹp..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {previewNextDue && (
          <div className="flex items-center gap-2.5 rounded-lg border border-success/25 bg-success-subtle/60 px-3.5 py-2.5 text-xs text-success">
            <CalendarCheck2 className="h-4 w-4 shrink-0" />
            <span>
              Hạn tiếp theo sẽ tự động đặt vào:{' '}
              <strong className="font-semibold">{previewNextDue}</strong>
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận hoàn thành'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
