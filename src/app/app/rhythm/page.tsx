'use client';

import React, { useMemo, useState } from 'react';
import { format, parseISO, isValid, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Activity, Flame, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { computeWeeklyMomentum, RHYTHM_TEMPLATES } from '@/lib/rhythm';
import {
  useCreateRhythmHabit,
  useCreateRhythmHabitsBulk,
  useDeleteRhythmHabit,
  useRhythmHabits,
  useRhythmLogs,
  useSetRhythmLogStatus,
  useUpdateRhythmHabit,
} from '@/hooks/useRhythm';
import type { RhythmColor, RhythmHabit, RhythmLogStatus } from '@/types/database';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { GithubHeatmap } from '@/components/rhythm/GithubHeatmap';
import { HabitRhythmCard } from '@/components/rhythm/HabitRhythmCard';
import { RhythmHabitModal } from '@/components/rhythm/RhythmHabitModal';

export default function RhythmPage() {
  const { data: habits = [], isLoading: habitsLoading } = useRhythmHabits();
  const { data: logs = [], isLoading: logsLoading } = useRhythmLogs();

  const createMutation = useCreateRhythmHabit();
  const bulkMutation = useCreateRhythmHabitsBulk();
  const updateMutation = useUpdateRhythmHabit();
  const deleteMutation = useDeleteRhythmHabit();
  const setStatusMutation = useSetRhythmLogStatus();

  const todayIso = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<RhythmHabit | null>(null);

  const isLoading = habitsLoading || logsLoading;

  const momentum = useMemo(
    () => computeWeeklyMomentum({ habits, logs }),
    [habits, logs]
  );

  const thisMondayIso = useMemo(
    () =>
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    []
  );

  const selectedDateLabel = useMemo(() => {
    if (selectedDate === todayIso) return 'Hôm nay';
    const parsed = parseISO(selectedDate);
    return isValid(parsed)
      ? format(parsed, 'EEEE, dd/MM', { locale: vi })
      : selectedDate;
  }, [selectedDate, todayIso]);

  const handleSaveHabit = async (
    payload: { title: string; weekly_target: number; color: RhythmColor },
    editingId?: string
  ) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, updates: payload });
        toast.success('Đã cập nhật mục tiêu.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Đã thêm mục tiêu mới.');
      }
      setIsModalOpen(false);
      setEditingHabit(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu.');
    }
  };

  const handleDeleteHabit = async (habit: RhythmHabit) => {
    if (!window.confirm(`Xóa mục tiêu "${habit.title}" và toàn bộ lịch sử?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(habit.id);
      if (selectedHabitId === habit.id) setSelectedHabitId(null);
      toast.success('Đã xóa mục tiêu.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa.');
    }
  };

  const handleSetStatus = async (
    habitId: string,
    status: RhythmLogStatus | null
  ) => {
    try {
      await setStatusMutation.mutateAsync({
        habitId,
        logDate: selectedDate,
        status,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật.');
    }
  };

  const handleSeedTemplates = async () => {
    try {
      await bulkMutation.mutateAsync(RHYTHM_TEMPLATES);
      toast.success('Đã khởi tạo 4 thói quen mẫu!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể khởi tạo.');
    }
  };

  const momentumLabel =
    momentum.weeklyPercent >= 80
      ? 'Giữ nhịp rất tốt'
      : momentum.weeklyPercent >= 50
      ? 'Đang vào guồng'
      : 'Nhẹ nhàng bắt đầu lại';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhịp sống"
        description="Theo dõi tiến độ không trừng phạt — không mất chuỗi về 0 khi bạn cần nghỉ ngơi."
        actions={
          <Button
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm mục tiêu
          </Button>
        }
      />

      {/* Momentum Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Nhịp tuần này"
          value={`${momentum.weeklyPercent}%`}
          hint={`${momentumLabel} (${momentum.weeklyDone}/${momentum.weeklyTargetTotal} buổi)`}
          icon={<Activity className="h-4 w-4" />}
          valueClassName={
            momentum.weeklyPercent >= 75 ? 'text-success' : 'text-primary'
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Xu hướng 30 ngày"
          value={`${momentum.monthPercent}%`}
          hint={
            momentum.trendDelta >= 0
              ? `+${momentum.trendDelta}% so với 30 ngày trước`
              : `${momentum.trendDelta}% so với 30 ngày trước`
          }
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Mục tiêu đang theo dõi"
          value={habits.filter((h) => h.is_active).length}
          hint="Linh hoạt theo mục tiêu tuần"
          icon={<Flame className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* GitHub Contributions Heatmap */}
      {isLoading ? (
        <Skeleton className="h-52 w-full rounded-2xl" />
      ) : (
        <GithubHeatmap
          habits={habits}
          logs={logs}
          selectedHabitId={selectedHabitId}
          onClearHabitFilter={() => setSelectedHabitId(null)}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      {/* Check-in Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground capitalize">
            Check-in: {selectedDateLabel}
          </h2>
          {selectedDate !== todayIso && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayIso)}
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Quay về hôm nay
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card backdrop-blur-xl p-8 text-center space-y-4">
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-semibold text-foreground">
                Chưa có mục tiêu nhịp sống nào
              </h3>
              <p className="text-sm text-text-muted">
                Khởi tạo nhanh 4 thói quen phổ biến với mục tiêu tuần linh hoạt hoặc tự tạo mục tiêu riêng.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                onClick={handleSeedTemplates}
                disabled={bulkMutation.isPending}
              >
                <Sparkles className="h-4 w-4" />
                {bulkMutation.isPending ? 'Đang tạo...' : 'Dùng 4 mẫu gợi ý'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingHabit(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Tự tạo mục tiêu
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => {
              const habitWeekLogs = logs.filter(
                (l) =>
                  l.habit_id === habit.id &&
                  l.log_date >= thisMondayIso &&
                  l.log_date <= todayIso
              );
              const weekDoneCount = habitWeekLogs.filter(
                (l) => l.status === 'DONE'
              ).length;
              const weekRestCount = habitWeekLogs.filter(
                (l) => l.status === 'REST'
              ).length;
              const selectedLog = logs.find(
                (l) => l.habit_id === habit.id && l.log_date === selectedDate
              );

              return (
                <HabitRhythmCard
                  key={habit.id}
                  habit={habit}
                  weekDoneCount={weekDoneCount}
                  weekRestCount={weekRestCount}
                  selectedDateStatus={selectedLog?.status ?? null}
                  isFiltered={selectedHabitId === habit.id}
                  onToggleFilter={() =>
                    setSelectedHabitId((prev) =>
                      prev === habit.id ? null : habit.id
                    )
                  }
                  onSetStatus={(status) => handleSetStatus(habit.id, status)}
                  onEdit={() => {
                    setEditingHabit(habit);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => handleDeleteHabit(habit)}
                  isBusy={setStatusMutation.isPending}
                />
              );
            })}
          </div>
        )}
      </div>

      <RhythmHabitModal
        key={editingHabit?.id ?? (isModalOpen ? 'new-open' : 'new-closed')}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        editingHabit={editingHabit}
        onSave={handleSaveHabit}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
