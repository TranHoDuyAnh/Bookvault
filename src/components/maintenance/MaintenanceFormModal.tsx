'use client';

import React, { useState } from 'react';
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

export function MaintenanceFormModal({
  isOpen,
  onClose,
  editingItem,
  onSave,
  isSaving = false,
}: MaintenanceFormModalProps) {
  const [title, setTitle] = useState(() => editingItem?.title ?? '');
  const [category, setCategory] = useState<MaintenanceCategory>(
    () => editingItem?.category ?? 'PERSONAL_CARE'
  );
  const [recurrenceMode, setRecurrenceMode] =
    useState<MaintenanceRecurrenceMode>(
      () => editingItem?.recurrence_mode ?? 'AFTER_COMPLETION'
    );
  const [intervalValue, setIntervalValue] = useState(() =>
    editingItem ? String(editingItem.interval_value) : '30'
  );
  const [intervalUnit, setIntervalUnit] = useState<MaintenanceIntervalUnit>(
    () => editingItem?.interval_unit ?? 'DAY'
  );
  const [remindBeforeDays, setRemindBeforeDays] = useState(() =>
    editingItem ? String(editingItem.remind_before_days) : '3'
  );
  const [nextDueAt, setNextDueAt] = useState(
    () =>
      editingItem?.next_due_at ??
      toISODate(addIntervalToDate(new Date(), 30, 'DAY'))
  );
  const [vehicleName, setVehicleName] = useState(
    () => editingItem?.vehicle_name ?? ''
  );
  const [intervalKm, setIntervalKm] = useState(() =>
    editingItem?.interval_km ? String(editingItem.interval_km) : ''
  );
  const [currentOdo, setCurrentOdo] = useState(() =>
    editingItem && editingItem.current_odo !== null
      ? String(editingItem.current_odo)
      : ''
  );
  const [estimatedCost, setEstimatedCost] = useState(() =>
    editingItem?.estimated_cost ? String(editingItem.estimated_cost) : ''
  );
  const [providerName, setProviderName] = useState(
    () => editingItem?.provider_name ?? ''
  );
  const [providerContact, setProviderContact] = useState(
    () => editingItem?.provider_contact ?? ''
  );
  const [autoRenew, setAutoRenew] = useState(
    () => editingItem?.auto_renew ?? false
  );
  const [notes, setNotes] = useState(() => editingItem?.notes ?? '');

  const applyTemplate = (templateKey: string) => {
    const tpl = MAINTENANCE_TEMPLATES.find((t) => t.key === templateKey);
    if (!tpl) return;
    setTitle(tpl.title);
    setCategory(tpl.category);
    setRecurrenceMode(tpl.recurrence_mode);
    setIntervalValue(String(tpl.interval_value));
    setIntervalUnit(tpl.interval_unit);
    setRemindBeforeDays(String(tpl.remind_before_days));
    setNextDueAt(
      toISODate(addIntervalToDate(new Date(), tpl.interval_value, tpl.interval_unit))
    );
    setIntervalKm(tpl.interval_km ? String(tpl.interval_km) : '');
    setEstimatedCost(tpl.estimated_cost ? String(tpl.estimated_cost) : '');
    setAutoRenew(Boolean(tpl.auto_renew));
    setNotes(tpl.notes || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInterval = Math.max(1, Number(intervalValue) || 1);
    const parsedRemind = Math.max(0, Number(remindBeforeDays) || 0);
    const parsedOdo = currentOdo.trim() ? Number(currentOdo) : null;

    await onSave(
      {
        title: title.trim(),
        category,
        recurrence_mode: recurrenceMode,
        interval_value: parsedInterval,
        interval_unit: intervalUnit,
        remind_before_days: parsedRemind,
        next_due_at: nextDueAt,
        vehicle_name: vehicleName.trim() || null,
        interval_km: intervalKm.trim() ? Number(intervalKm) : null,
        last_odo: editingItem ? editingItem.last_odo : parsedOdo,
        current_odo: parsedOdo,
        estimated_cost: estimatedCost.trim() ? Number(estimatedCost) : null,
        provider_name: providerName.trim() || null,
        provider_contact: providerContact.trim() || null,
        auto_renew: autoRenew,
        notes: notes.trim() || null,
        is_active: editingItem ? editingItem.is_active : true,
      },
      editingItem?.id
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Chỉnh sửa mục bảo trì' : 'Thêm mục bảo trì mới'}
      description="Thiết lập chu kỳ thông minh để không bỏ sót việc chăm sóc bản thân, nhà cửa & tài sản."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick template picker when creating */}
        {!editingItem && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Điền nhanh từ mẫu gợi ý:
            </span>
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
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-text-secondary">
              Tên công việc / hạng mục *
            </label>
            <Input
              required
              placeholder="Ví dụ: Cắt tóc, Giặt chăn ga, Thay nhớt xe..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Danh mục
            </label>
            <Select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as MaintenanceCategory)
              }
            >
              {MAINTENANCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Kiểu lặp lại
            </label>
            <Select
              value={recurrenceMode}
              onChange={(e) =>
                setRecurrenceMode(e.target.value as MaintenanceRecurrenceMode)
              }
            >
              {Object.entries(RECURRENCE_MODE_LABELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <p className="text-[11px] text-text-muted -mt-2">
          {RECURRENCE_MODE_LABELS[recurrenceMode].hint}
        </p>

        {/* Interval + Due date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Mỗi bao lâu
            </label>
            <Input
              type="number"
              min={1}
              required
              value={intervalValue}
              onChange={(e) => setIntervalValue(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Đơn vị
            </label>
            <Select
              value={intervalUnit}
              onChange={(e) =>
                setIntervalUnit(e.target.value as MaintenanceIntervalUnit)
              }
            >
              <option value="DAY">Ngày</option>
              <option value="WEEK">Tuần</option>
              <option value="MONTH">Tháng</option>
              <option value="YEAR">Năm</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Nhắc trước (ngày)
            </label>
            <Input
              type="number"
              min={0}
              required
              value={remindBeforeDays}
              onChange={(e) => setRemindBeforeDays(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Hạn kế tiếp *
            </label>
            <Input
              type="date"
              required
              value={nextDueAt}
              onChange={(e) => setNextDueAt(e.target.value)}
            />
          </div>
        </div>

        {/* Vehicle specific section */}
        {(category === 'VEHICLE' || recurrenceMode === 'USAGE_BASED') && (
          <div className="rounded-lg border border-border bg-secondary/40 p-3.5 space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Thông số phương tiện & Odo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Tên xe</label>
                <Input
                  placeholder="AirBlade 150..."
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">
                  Chu kỳ (km)
                </label>
                <Input
                  type="number"
                  min={100}
                  step={100}
                  placeholder="1500"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">
                  Odo hiện tại (km)
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="18500"
                  value={currentOdo}
                  onChange={(e) => setCurrentOdo(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cost & Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Chi phí dự kiến (₫)
            </label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="150000"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Tiệm quen / Nhà cung cấp
            </label>
            <Input
              placeholder="Tên tiệm, phòng khám..."
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              SĐT / Địa chỉ / Link
            </label>
            <Input
              placeholder="090..., link gia hạn"
              value={providerContact}
              onChange={(e) => setProviderContact(e.target.value)}
            />
          </div>
        </div>

        {category === 'SUBSCRIPTION' && (
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Dịch vụ có tự động trừ tiền gia hạn (Auto-renew)
          </label>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Ghi chú
          </label>
          <Textarea
            rows={2}
            placeholder="Kiểu tóc hay cắt, loại nhớt, hoặc những lưu ý riêng..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving || !title.trim()}>
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
