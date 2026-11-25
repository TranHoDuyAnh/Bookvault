import {
  addDays,
  format,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { RhythmColor, RhythmHabit, RhythmLog } from '@/types/database';

export const RHYTHM_COLORS: Record<
  RhythmColor,
  { label: string; dot: string; bar: string }
> = {
  emerald: {
    label: 'Xanh GitHub',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  blue: {
    label: 'Xanh Apple',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  violet: {
    label: 'Tím Indigo',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  amber: {
    label: 'Vàng ấm',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  rose: {
    label: 'Hồng san hô',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
};

export const RHYTHM_TEMPLATES: Array<{
  title: string;
  weekly_target: number;
  color: RhythmColor;
}> = [
  { title: 'Đọc sách 20 phút', weekly_target: 5, color: 'blue' },
  { title: 'Vận động / Thể dục', weekly_target: 4, color: 'emerald' },
  { title: 'Ngủ trước 23:00', weekly_target: 5, color: 'violet' },
  { title: 'Học kỹ năng mới', weekly_target: 3, color: 'amber' },
];

export interface HeatmapDayCell {
  date: string;
  dateLabel: string;
  doneCount: number;
  restCount: number;
  totalHabits: number;
  level: 0 | 1 | 2 | 3 | 4;
  isRestOnly: boolean;
  isFuture: boolean;
}

export interface HeatmapWeekColumn {
  weekStart: string;
  monthLabel: string | null;
  days: HeatmapDayCell[];
}

export function buildGithubHeatmapGrid(params: {
  habits: RhythmHabit[];
  logs: RhythmLog[];
  selectedHabitId?: string | null;
  weeksCount?: number;
  today?: Date;
}): {
  columns: HeatmapWeekColumn[];
  totalDoneInRange: number;
  activeDaysCount: number;
} {
  const {
    habits,
    logs,
    selectedHabitId = null,
    weeksCount = 52,
    today = new Date(),
  } = params;

  const todayStart = startOfDay(today);
  const currentWeekMonday = startOfWeek(todayStart, { weekStartsOn: 1 });
  const gridStartMonday = subWeeks(currentWeekMonday, weeksCount - 1);

  const activeHabits = habits.filter(
    (h) => h.is_active && (!selectedHabitId || h.id === selectedHabitId)
  );
  const totalHabits = Math.max(1, activeHabits.length);
  const allowedHabitIds = new Set(activeHabits.map((h) => h.id));

  // Map date -> { done, rest }
  const dayStats = new Map<string, { done: number; rest: number }>();
  for (const log of logs) {
    if (!allowedHabitIds.has(log.habit_id)) continue;
    const entry = dayStats.get(log.log_date) || { done: 0, rest: 0 };
    if (log.status === 'DONE') entry.done += 1;
    else if (log.status === 'REST') entry.rest += 1;
    dayStats.set(log.log_date, entry);
  }

  const columns: HeatmapWeekColumn[] = [];
  let prevMonth = -1;
  let totalDoneInRange = 0;
  let activeDaysCount = 0;

  for (let w = 0; w < weeksCount; w++) {
    const weekMonday = addDays(gridStartMonday, w * 7);
    const month = weekMonday.getMonth();
    const monthLabel =
      month !== prevMonth
        ? format(weekMonday, 'MMM', { locale: vi }).replace('.', '')
        : null;
    prevMonth = month;

    const days: HeatmapDayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = addDays(weekMonday, d);
      const iso = format(cellDate, 'yyyy-MM-dd');
      const isFuture = cellDate > todayStart;
      const stat = dayStats.get(iso) || { done: 0, rest: 0 };

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      const effectiveTarget = Math.max(1, totalHabits - stat.rest);
      const isRestOnly = stat.done === 0 && stat.rest > 0;

      if (!isFuture && stat.done > 0) {
        totalDoneInRange += stat.done;
        activeDaysCount += 1;
        const ratio = stat.done / effectiveTarget;
        if (ratio >= 0.99) level = 4;
        else if (ratio >= 0.66) level = 3;
        else if (ratio >= 0.34) level = 2;
        else level = 1;
      }

      days.push({
        date: iso,
        dateLabel: format(cellDate, 'EEEE, dd/MM/yyyy', { locale: vi }),
        doneCount: stat.done,
        restCount: stat.rest,
        totalHabits: activeHabits.length,
        level,
        isRestOnly,
        isFuture,
      });
    }

    columns.push({
      weekStart: format(weekMonday, 'yyyy-MM-dd'),
      monthLabel,
      days,
    });
  }

  return { columns, totalDoneInRange, activeDaysCount };
}

export function computeWeeklyMomentum(params: {
  habits: RhythmHabit[];
  logs: RhythmLog[];
  today?: Date;
}): {
  weeklyPercent: number;
  weeklyDone: number;
  weeklyTargetTotal: number;
  trendDelta: number;
  monthPercent: number;
} {
  const { habits, logs, today = new Date() } = params;
  const activeHabits = habits.filter((h) => h.is_active);
  if (activeHabits.length === 0) {
    return {
      weeklyPercent: 0,
      weeklyDone: 0,
      weeklyTargetTotal: 0,
      trendDelta: 0,
      monthPercent: 0,
    };
  }

  const todayStart = startOfDay(today);
  const thisMonday = startOfWeek(todayStart, { weekStartsOn: 1 });
  const thisMondayIso = format(thisMonday, 'yyyy-MM-dd');
  const todayIso = format(todayStart, 'yyyy-MM-dd');

  const activeIds = new Set(activeHabits.map((h) => h.id));

  // Count DONE and REST per habit in current week
  let weeklyDone = 0;
  let weeklyRestAdjustedTarget = 0;

  for (const h of activeHabits) {
    const habitWeekLogs = logs.filter(
      (l) =>
        l.habit_id === h.id &&
        l.log_date >= thisMondayIso &&
        l.log_date <= todayIso
    );
    const doneCount = habitWeekLogs.filter((l) => l.status === 'DONE').length;
    const restCount = habitWeekLogs.filter((l) => l.status === 'REST').length;
    const adjustedTarget = Math.max(1, h.weekly_target - restCount);
    weeklyDone += Math.min(doneCount, adjustedTarget);
    weeklyRestAdjustedTarget += adjustedTarget;
  }

  const weeklyPercent =
    weeklyRestAdjustedTarget > 0
      ? Math.min(100, Math.round((weeklyDone / weeklyRestAdjustedTarget) * 100))
      : 100;

  // 30-day momentum vs previous 30 days
  const last30Start = format(subDays(todayStart, 29), 'yyyy-MM-dd');
  const prev30Start = format(subDays(todayStart, 59), 'yyyy-MM-dd');
  const prev30End = format(subDays(todayStart, 30), 'yyyy-MM-dd');

  const weeklyTargetSum = activeHabits.reduce((s, h) => s + h.weekly_target, 0);
  const expectedIn30Days = Math.max(1, Math.round((weeklyTargetSum / 7) * 30));

  const last30Done = logs.filter(
    (l) =>
      activeIds.has(l.habit_id) &&
      l.status === 'DONE' &&
      l.log_date >= last30Start &&
      l.log_date <= todayIso
  ).length;

  const prev30Done = logs.filter(
    (l) =>
      activeIds.has(l.habit_id) &&
      l.status === 'DONE' &&
      l.log_date >= prev30Start &&
      l.log_date <= prev30End
  ).length;

  const monthPercent = Math.min(
    100,
    Math.round((last30Done / expectedIn30Days) * 100)
  );
  const prevMonthPercent = Math.min(
    100,
    Math.round((prev30Done / expectedIn30Days) * 100)
  );

  return {
    weeklyPercent,
    weeklyDone,
    weeklyTargetTotal: weeklyRestAdjustedTarget,
    trendDelta: monthPercent - prevMonthPercent,
    monthPercent,
  };
}
