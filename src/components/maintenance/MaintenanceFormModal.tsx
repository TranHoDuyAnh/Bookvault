'use client';

import React, { useMemo, useState } from 'react';
import { differenceInCalendarDays, format, isValid, parseISO, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarCheck2, ChevronDown } from 'lucide-react';
import {
  addIntervalToDate,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_TEMPLATES,
  RECURRENCE_MODE_LABELS,
  toISODate,
} from '@/lib/maintenance';
import type {
  MaintenanceCategory,
  MaintenanceIntervalUnit,
  MaintenanceItem,
  MaintenanceRecurrenceMode,
} from '@/types/database';
import type { CreateMaintenanceItemInput } from '@/services/maintenance';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: MaintenanceItem | null;
  onSave: (
    payload: Omit<CreateMaintenanceItemInput, 'user_id'>,
    editingId?: string
  ) => Promise<void>;
  isSaving?: boolean;
}

interface FormState {
  title: string;
  category: MaintenanceCategory;
  recurrenceMode: MaintenanceRecurrenceMode;
  intervalValue: string;
  intervalUnit: MaintenanceIntervalUnit;
  remindBeforeDays: string;
  lastDoneAt: string;
  manualDueOverride: boolean;
  manualNextDueAt: string;
  vehicleName: string;
  intervalKm: string;
  currentOdo: string;
  estimatedCost: string;
  providerName: string;
  providerContact: string;
  autoRenew: boolean;
  notes: string;
}

function buildInitialState(item?: MaintenanceItem | null): FormState {
  const today = toISODate(new Date());
  return {
    title: item?.title ?? '',
    category: item?.category ?? 'PERSONAL_CARE',
    recurrenceMode: item?.recurrence_mode ?? 'AFTER_COMPLETION',
    intervalValue: item ? String(item.interval_value) : '30',
    intervalUnit: item?.interval_unit ?? 'DAY',
    remindBeforeDays: item ? String(item.remind_before_days) : '3',
    lastDoneAt: item ? item.last_done_at ?? '' : today,
    manualDueOverride: false,
    manualNextDueAt:
      item?.next_due_at ?? toISODate(addIntervalToDate(new Date(), 30, 'DAY')),
    vehicleName: item?.vehicle_name ?? '',
    intervalKm: item?.interval_km ? String(item.interval_km) : '',
    currentOdo: item && item.current_odo !== null ? String(item.current_odo) : '',
    estimatedCost: item?.estimated_cost ? String(item.estimated_cost) : '',
    providerName: item?.provider_name ?? '',
    providerContact: item?.provider_contact ?? '',
    autoRenew: item?.auto_renew ?? false,
    notes: item?.notes ?? '',
  };
}

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

export function MaintenanceFormModal({
  isOpen,
  onClose,
  editingItem,
  onSave,
  isSaving = false,
}: MaintenanceFormModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(editingItem));
  const [showExtras, setShowExtras] = useState(
    () =>
      Boolean(
        editingItem?.provider_name ||
          editingItem?.provider_contact ||
          editingItem?.notes ||
          editingItem?.estimated_cost
      )
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const computedNextDueAt = useMemo(() => {
    if (form.manualDueOverride && form.manualNextDueAt) return form.manualNextDueAt;
    if (!form.lastDoneAt) return toISODate(new Date());
    const base = parseISO(form.lastDoneAt);
    if (!isValid(base)) return toISODate(new Date());
    const val = Math.max(1, Number(form.intervalValue) || 1);
    return toISODate(addIntervalToDate(base, val, form.intervalUnit));
  }, [
    form.manualDueOverride,
    form.manualNextDueAt,
    form.lastDoneAt,
    form.intervalValue,
    form.intervalUnit,
  ]);

  const duePreview = useMemo(() => {
    const parsed = parseISO(computedNextDueAt);
    if (!isValid(parsed)) return null;
    const diff = differenceInCalendarDays(parsed, new Date());
    const diffText =
      diff < 0
        ? `quá hạn ${Math.abs(diff)} ngày`
        : diff === 0
        ? 'hôm nay'
        : diff === 1
        ? 'ngày mai'
        : `còn ${diff} ngày`;
    return {
      dateLabel: format(parsed, 'dd/MM/yyyy', { locale: vi }),
      diff,
      diffText,
    };
  }, [computedNextDueAt]);

  const applyTemplate = (key: string) => {
    const tpl = MAINTENANCE_TEMPLATES.find((t) => t.key === key);
    if (!tpl) return;
    setForm((prev) => ({
      ...prev,
      title: tpl.title,
      category: tpl.category,
      recurrenceMode: tpl.recurrence_mode,
      intervalValue: String(tpl.interval_value),
      intervalUnit: tpl.interval_unit,
      remindBeforeDays: String(tpl.remind_before_days),
      manualDueOverride: false,
      intervalKm: tpl.interval_km ? String(tpl.interval_km) : '',
      estimatedCost: tpl.estimated_cost ? String(tpl.estimated_cost) : '',
      autoRenew: Boolean(tpl.auto_renew),
      notes: tpl.notes || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const odo = form.currentOdo.trim() ? Number(form.currentOdo) : null;
    await onSave(
      {
        title: form.title.trim(),
        category: form.category,
        recurrence_mode: form.recurrenceMode,
        interval_value: Math.max(1, Number(form.intervalValue) || 1),
        interval_unit: form.intervalUnit,
        remind_before_days: Math.max(0, Number(form.remindBeforeDays) || 0),
        last_done_at: form.lastDoneAt || null,
        next_due_at: computedNextDueAt,
        vehicle_name: form.vehicleName.trim() || null,
        interval_km: form.intervalKm.trim() ? Number(form.intervalKm) : null,
        last_odo: editingItem ? editingItem.last_odo : odo,
        current_odo: odo,
        estimated_cost: form.estimatedCost.trim() ? Number(form.estimatedCost) : null,
        provider_name: form.providerName.trim() || null,
        provider_contact: form.providerContact.trim() || null,
        auto_renew: form.autoRenew,
        notes: form.notes.trim() || null,
        is_active: editingItem ? editingItem.is_active : true,
      },
      editingItem?.id
    );
  };

  const presets = [
    { label: 'Hôm nay', value: toISODate(new Date()) },
    { label: 'Hôm qua', value: toISODate(subDays(new Date(), 1)) },
    { label: '7 ngày trước', value: toISODate(subDays(new Date(), 7)) },
    { label: 'Chưa làm bao giờ', value: '' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Chỉnh sửa mục bảo trì' : 'Thêm mục bảo trì mới'}
      description="Chỉ cần chọn ngày làm gần nhất, HomeBase sẽ tự tính hạn kế tiếp cho bạn."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!editingItem && (
          <div className="flex flex-wrap gap-1.5">
            {MAINTENANCE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.key}
                type="button"
                onClick={() => applyTemplate(tpl.key)}
                className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                + {tpl.title}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tên công việc / hạng mục *" className="sm:col-span-2">
            <Input
              required
              placeholder="Ví dụ: Cắt tóc, Giặt chăn ga, Thay nhớt xe..."
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
            />
          </Field>

          <Field label="Danh mục">
            <Select
              value={form.category}
              onChange={(e) =>
                setField('category', e.target.value as MaintenanceCategory)
              }
            >
              {MAINTENANCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Kiểu lặp lại">
            <Select
              value={form.recurrenceMode}
              onChange={(e) =>
                setField(
                  'recurrenceMode',
                  e.target.value as MaintenanceRecurrenceMode
                )
              }
            >
              {Object.entries(RECURRENCE_MODE_LABELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Mỗi bao lâu">
            <Input
              type="number"
              min={1}
              required
              value={form.intervalValue}
              onChange={(e) => setField('intervalValue', e.target.value)}
            />
          </Field>
          <Field label="Đơn vị">
            <Select
              value={form.intervalUnit}
              onChange={(e) =>
                setField('intervalUnit', e.target.value as MaintenanceIntervalUnit)
              }
            >
              <option value="DAY">Ngày</option>
              <option value="WEEK">Tuần</option>
              <option value="MONTH">Tháng</option>
              <option value="YEAR">Năm</option>
            </Select>
          </Field>
          <Field label="Nhắc trước (ngày)">
            <Input
              type="number"
              min={0}
              required
              value={form.remindBeforeDays}
              onChange={(e) => setField('remindBeforeDays', e.target.value)}
            />
          </Field>
        </div>

        {/* Last Done Date -> Auto Calculate Next Due */}
        <div className="rounded-lg border border-border bg-secondary/35 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground">
              Lần gần nhất bạn làm là khi nào?
            </span>
            <div className="flex flex-wrap gap-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      lastDoneAt: p.value,
                      manualDueOverride: false,
                    }))
                  }
                  className={
                    form.lastDoneAt === p.value
                      ? 'rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground cursor-pointer'
                      : 'rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-accent cursor-pointer'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
            <Input
              type="date"
              value={form.lastDoneAt}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  lastDoneAt: e.target.value,
                  manualDueOverride: false,
                }))
              }
            />
            {duePreview && (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 truncate text-text-secondary">
                  <CalendarCheck2 className="h-4 w-4 shrink-0 text-success" />
                  Hạn tới:{' '}
                  <strong className="text-foreground">{duePreview.dateLabel}</strong>
                  <span
                    className={
                      duePreview.diff < 0 ? 'text-destructive font-medium' : 'text-text-muted'
                    }
                  >
                    ({duePreview.diffText})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      manualNextDueAt: prev.manualDueOverride
                        ? prev.manualNextDueAt
                        : computedNextDueAt,
                      manualDueOverride: !prev.manualDueOverride,
                    }))
                  }
                  className="shrink-0 text-[11px] text-text-muted underline hover:text-foreground cursor-pointer"
                >
                  {form.manualDueOverride ? 'Tự tính' : 'Chỉnh tay'}
                </button>
              </div>
            )}
          </div>

          {form.manualDueOverride && (
            <Field label="Ngày đến hạn tùy chỉnh">
              <Input
                type="date"
                required
                value={form.manualNextDueAt}
                onChange={(e) => setField('manualNextDueAt', e.target.value)}
              />
            </Field>
          )}
        </div>

        {(form.category === 'VEHICLE' || form.recurrenceMode === 'USAGE_BASED') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <Field label="Tên xe">
              <Input
                placeholder="AirBlade 150..."
                value={form.vehicleName}
                onChange={(e) => setField('vehicleName', e.target.value)}
              />
            </Field>
            <Field label="Chu kỳ (km)">
              <Input
                type="number"
                min={100}
                step={100}
                placeholder="1500"
                value={form.intervalKm}
                onChange={(e) => setField('intervalKm', e.target.value)}
              />
            </Field>
            <Field label="Odo hiện tại (km)">
              <Input
                type="number"
                min={0}
                placeholder="18500"
                value={form.currentOdo}
                onChange={(e) => setField('currentOdo', e.target.value)}
              />
            </Field>
          </div>
        )}

        {form.category === 'SUBSCRIPTION' && (
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.autoRenew}
              onChange={(e) => setField('autoRenew', e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Dịch vụ tự động trừ tiền gia hạn (Auto-renew)
          </label>
        )}

        {/* Collapsible Extras */}
        <div className="border-t border-border pt-2">
          <button
            type="button"
            onClick={() => setShowExtras((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-foreground cursor-pointer"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showExtras ? 'rotate-180' : ''
              }`}
            />
            Chi tiết thêm (chi phí, tiệm quen, ghi chú)
          </button>

          {showExtras && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Chi phí dự kiến (₫)">
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="150000"
                    value={form.estimatedCost}
                    onChange={(e) => setField('estimatedCost', e.target.value)}
                  />
                </Field>
                <Field label="Tiệm quen / Nơi làm">
                  <Input
                    placeholder="Tên tiệm, phòng khám..."
                    value={form.providerName}
                    onChange={(e) => setField('providerName', e.target.value)}
                  />
                </Field>
                <Field label="SĐT / Địa chỉ / Link">
                  <Input
                    placeholder="090..., link gia hạn"
                    value={form.providerContact}
                    onChange={(e) => setField('providerContact', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Ghi chú">
                <Textarea
                  rows={2}
                  placeholder="Kiểu tóc hay cắt, loại nhớt, hoặc lưu ý riêng..."
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving || !form.title.trim()}>
            {isSaving
              ? 'Đang lưu...'
              : editingItem
              ? 'Lưu thay đổi'
              : 'Tạo mục bảo trì'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
