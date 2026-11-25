'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Plus,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { differenceInCalendarDays, isSameMonth, parseISO, isValid } from 'date-fns';
import {
  addIntervalToDate,
  CATEGORY_MAP,
  evaluateMaintenanceItem,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_TEMPLATES,
  toISODate,
} from '@/lib/maintenance';
import {
  useCompleteMaintenanceItem,
  useCreateMaintenanceItem,
  useCreateMaintenanceItemsBulk,
  useDeleteMaintenanceItem,
  useMaintenanceItems,
  useMaintenanceLogs,
  useSnoozeMaintenanceItem,
  useUpdateMaintenanceItem,
} from '@/hooks/useMaintenance';
import type { MaintenanceCategory, MaintenanceItem } from '@/types/database';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { MaintenanceCard } from '@/components/maintenance/MaintenanceCard';
import { MaintenanceFormModal } from '@/components/maintenance/MaintenanceFormModal';
import { CompleteMaintenanceModal } from '@/components/maintenance/CompleteMaintenanceModal';
import { MaintenanceHistoryModal } from '@/components/maintenance/MaintenanceHistoryModal';
import { CategoryIcon } from '@/components/maintenance/CategoryIcon';
import { cn } from '@/lib/utils';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

const URGENCY_RANK = {
  OVERDUE: 0,
  DUE_SOON: 1,
  UPCOMING: 2,
  SNOOZED: 3,
  PAUSED: 4,
};

export default function MaintenancePage() {
  const { data: items = [], isLoading } = useMaintenanceItems();
  const { data: allLogs = [] } = useMaintenanceLogs();

  const createMutation = useCreateMaintenanceItem();
  const bulkCreateMutation = useCreateMaintenanceItemsBulk();
  const updateMutation = useUpdateMaintenanceItem();
  const deleteMutation = useDeleteMaintenanceItem();
  const completeMutation = useCompleteMaintenanceItem();
  const snoozeMutation = useSnoozeMaintenanceItem();

  const [selectedCategory, setSelectedCategory] = useState<
    MaintenanceCategory | 'ALL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAttention, setOnlyAttention] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [completingItem, setCompletingItem] = useState<MaintenanceItem | null>(
    null
  );
  const [historyItem, setHistoryItem] = useState<MaintenanceItem | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(() =>
    MAINTENANCE_TEMPLATES.map((t) => t.key)
  );

  const evaluatedItems = useMemo(() => {
    return items
      .map((item) => evaluateMaintenanceItem(item))
      .sort((a, b) => {
        const rankDiff = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
        if (rankDiff !== 0) return rankDiff;
        return a.daysUntilDue - b.daysUntilDue;
      });
  }, [items]);

  const stats = useMemo(() => {
    const active = evaluatedItems.filter((e) => e.urgency !== 'PAUSED');
    const attentionCount = active.filter(
      (e) => e.urgency === 'OVERDUE' || e.urgency === 'DUE_SOON'
    ).length;
    const overdueCount = active.filter((e) => e.urgency === 'OVERDUE').length;
    const onTrackCount = active.filter((e) => e.urgency !== 'OVERDUE').length;
    const healthScore =
      active.length > 0 ? Math.round((onTrackCount / active.length) * 100) : 100;

    const now = new Date();
    const upcomingCost30Days = active.reduce((sum, e) => {
      const due = parseISO(e.item.next_due_at);
      if (!isValid(due)) return sum;
      const diff = differenceInCalendarDays(due, now);
      if (diff <= 30 && e.item.estimated_cost) {
        return sum + Number(e.item.estimated_cost);
      }
      return sum;
    }, 0);

    const doneThisMonth = allLogs.filter((l) => {
      const d = parseISO(l.done_at);
      return isValid(d) && isSameMonth(d, now);
    }).length;

    return {
      attentionCount,
      overdueCount,
      healthScore,
      upcomingCost30Days,
      doneThisMonth,
    };
  }, [evaluatedItems, allLogs]);

  const filteredItems = useMemo(() => {
    return evaluatedItems.filter((e) => {
      if (selectedCategory !== 'ALL' && e.item.category !== selectedCategory) {
        return false;
      }
      if (
        onlyAttention &&
        e.urgency !== 'OVERDUE' &&
        e.urgency !== 'DUE_SOON'
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = [
          e.item.title,
          e.item.provider_name,
          e.item.vehicle_name,
          e.item.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [evaluatedItems, selectedCategory, onlyAttention, searchQuery]);

  const handleSaveItem = async (
    payload: Parameters<typeof createMutation.mutateAsync>[0],
    editingId?: string
  ) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, updates: payload });
        toast.success('Đã cập nhật mục bảo trì.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Đã thêm mục bảo trì mới.');
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu.');
    }
  };

  const handleComplete = async (payload: {
    doneAt: string;
    cost: number | null;
    odoAtDone: number | null;
    providerName: string | null;
    rating: number | null;
    notes: string | null;
  }) => {
    if (!completingItem) return;
    try {
      await completeMutation.mutateAsync({
        item: completingItem,
        ...payload,
      });
      toast.success(`Đã hoàn thành "${completingItem.title}" & cập nhật lịch mới!`);
      setCompletingItem(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    }
  };

  const handleSnooze = async (item: MaintenanceItem, days: number) => {
    try {
      await snoozeMutation.mutateAsync({ id: item.id, days });
      toast.success(`Đã hoãn "${item.title}" thêm ${days} ngày.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể hoãn.');
    }
  };

  const handleToggleActive = async (item: MaintenanceItem) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        updates: { is_active: !item.is_active },
      });
      toast.success(
        item.is_active ? 'Đã tạm ngưng nhắc mục này.' : 'Đã kích hoạt lại mục này.'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật.');
    }
  };

  const handleDelete = async (item: MaintenanceItem) => {
    if (!window.confirm(`Xóa "${item.title}" và toàn bộ lịch sử của mục này?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xóa mục bảo trì.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa.');
    }
  };

  const handleBulkImportTemplates = async () => {
    const chosen = MAINTENANCE_TEMPLATES.filter((t) =>
      selectedTemplates.includes(t.key)
    );
    if (chosen.length === 0) return;

    const today = new Date();
    try {
      await bulkCreateMutation.mutateAsync(
        chosen.map((tpl) => ({
          title: tpl.title,
          category: tpl.category,
          recurrence_mode: tpl.recurrence_mode,
          interval_value: tpl.interval_value,
          interval_unit: tpl.interval_unit,
          remind_before_days: tpl.remind_before_days,
          next_due_at: toISODate(
            addIntervalToDate(today, tpl.interval_value, tpl.interval_unit)
          ),
          interval_km: tpl.interval_km ?? null,
          estimated_cost: tpl.estimated_cost ?? null,
          auto_renew: Boolean(tpl.auto_renew),
          notes: tpl.notes ?? null,
          is_active: true,
        }))
      );
      toast.success(`Đã khởi tạo ${chosen.length} hạng mục bảo trì!`);
      setIsTemplateModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể khởi tạo mẫu.');
    }
  };

  const toggleTemplateKey = (key: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảo trì cuộc sống"
        description="Nhắc lịch cắt tóc, giặt chăn ga, dọn phòng, bảo dưỡng xe, vệ sinh laptop, khám sức khỏe và gia hạn dịch vụ."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Bộ mẫu gợi ý
            </Button>
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm mục mới
            </Button>
          </>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Cần xử lý ngay"
          value={stats.attentionCount}
          hint={
            stats.overdueCount > 0
              ? `${stats.overdueCount} mục đang quá hạn`
              : 'Bao gồm việc sắp đến hạn'
          }
          icon={<AlertCircle className="h-4 w-4" />}
          valueClassName={
            stats.overdueCount > 0 ? 'text-destructive' : undefined
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Nhịp bảo trì"
          value={`${stats.healthScore}%`}
          hint="Tỷ lệ hạng mục đúng hạn"
          icon={<Wrench className="h-4 w-4" />}
          valueClassName={
            stats.healthScore >= 80 ? 'text-success' : 'text-warning'
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Dự chi 30 ngày tới"
          value={formatCurrency(stats.upcomingCost30Days)}
          hint="Ước tính từ các mục sắp đến hạn"
          icon={<Coins className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Hoàn thành tháng này"
          value={stats.doneThisMonth}
          hint="Số lượt bảo trì đã ghi nhận"
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Tìm tên việc, tiệm quen, xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyAttention((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto',
              onlyAttention
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-text-secondary hover:bg-accent'
            )}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Chỉ xem việc sắp tới / quá hạn
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              selectedCategory === 'ALL'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-text-secondary hover:bg-accent'
            )}
          >
            Tất cả ({items.length})
          </button>
          {MAINTENANCE_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.value).length;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-text-secondary hover:bg-accent'
                )}
              >
                <CategoryIcon category={cat.value} className="h-3.5 w-3.5" />
                {cat.shortLabel}
                {count > 0 && <span className="opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-foreground">
              Chưa có lịch bảo trì nào
            </h3>
            <p className="text-sm text-text-muted">
              Bắt đầu nhanh với bộ 8 mẫu thiết yếu (cắt tóc, giặt chăn ga, dọn phòng, bảo dưỡng xe, vệ sinh laptop, khám sức khỏe & gia hạn dịch vụ).
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => setIsTemplateModalOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Khởi tạo từ bộ mẫu gợi ý
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Tự tạo mục đầu tiên
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-text-muted">
          Không tìm thấy mục bảo trì nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((evaluated) => (
            <MaintenanceCard
              key={evaluated.item.id}
              evaluated={evaluated}
              onComplete={() => setCompletingItem(evaluated.item)}
              onSnooze={(days) => handleSnooze(evaluated.item, days)}
              onEdit={() => {
                setEditingItem(evaluated.item);
                setIsFormOpen(true);
              }}
              onHistory={() => setHistoryItem(evaluated.item)}
              onToggleActive={() => handleToggleActive(evaluated.item)}
              onDelete={() => handleDelete(evaluated.item)}
              isBusy={
                completeMutation.isPending ||
                snoozeMutation.isPending ||
                updateMutation.isPending
              }
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <MaintenanceFormModal
        key={editingItem?.id ?? (isFormOpen ? 'new-open' : 'new-closed')}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSave={handleSaveItem}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <CompleteMaintenanceModal
        key={completingItem?.id ?? 'complete-closed'}
        item={completingItem}
        isOpen={!!completingItem}
        onClose={() => setCompletingItem(null)}
        onSubmit={handleComplete}
        isSubmitting={completeMutation.isPending}
      />

      <MaintenanceHistoryModal
        item={historyItem}
        isOpen={!!historyItem}
        onClose={() => setHistoryItem(null)}
      />

      {/* Bulk Template Picker Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Khởi tạo nhanh từ bộ mẫu gợi ý"
        description="Chọn những việc bạn muốn HomeBase tự động theo dõi và nhắc lịch định kỳ."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
            {MAINTENANCE_TEMPLATES.map((tpl) => {
              const checked = selectedTemplates.includes(tpl.key);
              const catMeta = CATEGORY_MAP[tpl.category];
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => toggleTemplateKey(tpl.key)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer',
                    checked
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-accent/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border mt-0.5',
                      catMeta.accentBg,
                      catMeta.accentText,
                      catMeta.accentBorder
                    )}
                  >
                    <CategoryIcon category={tpl.category} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {tpl.title}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="h-4 w-4 rounded accent-primary pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Mỗi {tpl.interval_value}{' '}
                      {tpl.interval_unit === 'DAY'
                        ? 'ngày'
                        : tpl.interval_unit === 'WEEK'
                        ? 'tuần'
                        : tpl.interval_unit === 'MONTH'
                        ? 'tháng'
                        : 'năm'}
                      {tpl.interval_km
                        ? ` / ${tpl.interval_km.toLocaleString('vi-VN')} km`
                        : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-text-muted">
              Đã chọn {selectedTemplates.length}/{MAINTENANCE_TEMPLATES.length} mục
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={handleBulkImportTemplates}
                disabled={
                  selectedTemplates.length === 0 || bulkCreateMutation.isPending
                }
              >
                {bulkCreateMutation.isPending
                  ? 'Đang khởi tạo...'
                  : `Thêm ${selectedTemplates.length} mục`}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
