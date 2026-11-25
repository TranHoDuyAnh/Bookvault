import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import type {
  MaintenanceCategory,
  MaintenanceIntervalUnit,
  MaintenanceItem,
  MaintenanceRecurrenceMode,
  MaintenanceUrgency,
} from '@/types/database';

export interface MaintenanceCategoryMeta {
  value: MaintenanceCategory;
  label: string;
  shortLabel: string;
  description: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export const MAINTENANCE_CATEGORIES: MaintenanceCategoryMeta[] = [
  {
    value: 'PERSONAL_CARE',
    label: 'Chăm sóc cá nhân',
    shortLabel: 'Cá nhân',
    description: 'Cắt tóc, cạo râu, chăm sóc da, cắt móng...',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-700 dark:text-amber-300',
    accentBorder: 'border-amber-500/25',
  },
  {
    value: 'LAUNDRY',
    label: 'Chăn ga & Giặt giũ',
    shortLabel: 'Chăn ga',
    description: 'Giặt ga giường, vỏ gối, chăn mền, rèm cửa...',
    accentBg: 'bg-sky-500/10',
    accentText: 'text-sky-700 dark:text-sky-300',
    accentBorder: 'border-sky-500/25',
  },
  {
    value: 'CLEANING',
    label: 'Vệ sinh phòng & Nhà',
    shortLabel: 'Nhà cửa',
    description: 'Dọn phòng, rửa lọc máy lạnh, vệ sinh tủ lạnh...',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-700 dark:text-emerald-300',
    accentBorder: 'border-emerald-500/25',
  },
  {
    value: 'VEHICLE',
    label: 'Bảo dưỡng xe',
    shortLabel: 'Xe cộ',
    description: 'Thay nhớt, lốp, phanh, bảo hiểm & đăng kiểm...',
    accentBg: 'bg-orange-500/10',
    accentText: 'text-orange-700 dark:text-orange-300',
    accentBorder: 'border-orange-500/25',
  },
  {
    value: 'TECH',
    label: 'Thiết bị & Laptop',
    shortLabel: 'Laptop',
    description: 'Vệ sinh laptop, thổi bụi quạt, sao lưu dữ liệu...',
    accentBg: 'bg-indigo-500/10',
    accentText: 'text-indigo-700 dark:text-indigo-300',
    accentBorder: 'border-indigo-500/25',
  },
  {
    value: 'HEALTH',
    label: 'Khám sức khỏe',
    shortLabel: 'Sức khỏe',
    description: 'Khám tổng quát, lấy cao răng, khám mắt, tiêm ngừa...',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-700 dark:text-rose-300',
    accentBorder: 'border-rose-500/25',
  },
  {
    value: 'SUBSCRIPTION',
    label: 'Gia hạn dịch vụ',
    shortLabel: 'Dịch vụ',
    description: 'iCloud, Spotify, Netflix, tên miền, gói tập...',
    accentBg: 'bg-violet-500/10',
    accentText: 'text-violet-700 dark:text-violet-300',
    accentBorder: 'border-violet-500/25',
  },
  {
    value: 'OTHER',
    label: 'Khác',
    shortLabel: 'Khác',
    description: 'Các việc định kỳ cá nhân khác.',
    accentBg: 'bg-zinc-500/10',
    accentText: 'text-zinc-700 dark:text-zinc-300',
    accentBorder: 'border-zinc-500/25',
  },
];

export const CATEGORY_MAP: Record<MaintenanceCategory, MaintenanceCategoryMeta> =
  MAINTENANCE_CATEGORIES.reduce(
    (acc, item) => {
      acc[item.value] = item;
      return acc;
    },
    {} as Record<MaintenanceCategory, MaintenanceCategoryMeta>
  );

export const RECURRENCE_MODE_LABELS: Record<
  MaintenanceRecurrenceMode,
  { label: string; hint: string }
> = {
  AFTER_COMPLETION: {
    label: 'Chu kỳ trượt (sau khi làm)',
    hint: 'Lần tới = Ngày vừa làm + chu kỳ. Phù hợp cắt tóc, giặt đồ, vệ sinh.',
  },
  FIXED_CALENDAR: {
    label: 'Cố định theo lịch',
    hint: 'Giữ nguyên ngày cố định hàng tháng/năm. Phù hợp gia hạn dịch vụ, bảo hiểm.',
  },
  USAGE_BASED: {
    label: 'Kết hợp Thời gian + Số km (Odo)',
    hint: 'Nhắc khi đến hạn ngày hoặc chạy đủ số km (cái nào tới trước).',
  },
};

export const INTERVAL_UNIT_LABELS: Record<MaintenanceIntervalUnit, string> = {
  DAY: 'ngày',
  WEEK: 'tuần',
  MONTH: 'tháng',
  YEAR: 'năm',
};

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function addIntervalToDate(
  baseDate: Date,
  value: number,
  unit: MaintenanceIntervalUnit
): Date {
  switch (unit) {
    case 'DAY':
      return addDays(baseDate, value);
    case 'WEEK':
      return addWeeks(baseDate, value);
    case 'MONTH':
      return addMonths(baseDate, value);
    case 'YEAR':
      return addYears(baseDate, value);
  }
}

export function computeNextDueDate(params: {
  recurrenceMode: MaintenanceRecurrenceMode;
  intervalValue: number;
  intervalUnit: MaintenanceIntervalUnit;
  doneAt: string;
  currentDueAt?: string | null;
}): string {
  const doneDate = parseISO(params.doneAt);
  const safeDone = isValid(doneDate) ? doneDate : new Date();

  if (params.recurrenceMode === 'FIXED_CALENDAR' && params.currentDueAt) {
    let candidate = parseISO(params.currentDueAt);
    if (!isValid(candidate)) {
      candidate = safeDone;
    }
    let next = addIntervalToDate(
      candidate,
      params.intervalValue,
      params.intervalUnit
    );
    // If fixed schedule is far behind doneDate, advance until > doneDate
    let guard = 0;
    while (next <= safeDone && guard < 120) {
      next = addIntervalToDate(next, params.intervalValue, params.intervalUnit);
      guard += 1;
    }
    return toISODate(next);
  }

  return toISODate(
    addIntervalToDate(safeDone, params.intervalValue, params.intervalUnit)
  );
}

export interface EvaluatedMaintenanceItem {
  item: MaintenanceItem;
  urgency: MaintenanceUrgency;
  daysUntilDue: number;
  effectiveDueDate: string;
  kmRemaining: number | null;
  isOdoDue: boolean;
}

export function evaluateMaintenanceItem(
  item: MaintenanceItem,
  today: Date = new Date()
): EvaluatedMaintenanceItem {
  const todayStart = startOfDay(today);

  if (!item.is_active) {
    const due = parseISO(item.next_due_at);
    return {
      item,
      urgency: 'PAUSED',
      daysUntilDue: isValid(due) ? differenceInCalendarDays(due, todayStart) : 0,
      effectiveDueDate: item.next_due_at,
      kmRemaining: null,
      isOdoDue: false,
    };
  }

  const snoozed = item.snoozed_until ? parseISO(item.snoozed_until) : null;
  const isSnoozed =
    snoozed !== null && isValid(snoozed) && startOfDay(snoozed) > todayStart;

  const effectiveDueStr =
    isSnoozed && item.snoozed_until ? item.snoozed_until : item.next_due_at;
  const effectiveDueDate = parseISO(effectiveDueStr);
  const daysUntilDue = isValid(effectiveDueDate)
    ? differenceInCalendarDays(effectiveDueDate, todayStart)
    : 0;

  let kmRemaining: number | null = null;
  let isOdoDue = false;
  if (
    item.recurrence_mode === 'USAGE_BASED' &&
    item.interval_km &&
    item.current_odo !== null &&
    item.last_odo !== null
  ) {
    const targetOdo = item.last_odo + item.interval_km;
    kmRemaining = targetOdo - item.current_odo;
    isOdoDue = kmRemaining <= 0;
  }

  let urgency: MaintenanceUrgency = 'UPCOMING';
  if (isSnoozed && !isOdoDue) {
    urgency = 'SNOOZED';
  } else if (daysUntilDue < 0 || isOdoDue) {
    urgency = 'OVERDUE';
  } else if (
    daysUntilDue <= item.remind_before_days ||
    (kmRemaining !== null && kmRemaining <= 200)
  ) {
    urgency = 'DUE_SOON';
  }

  return {
    item,
    urgency,
    daysUntilDue,
    effectiveDueDate: effectiveDueStr,
    kmRemaining,
    isOdoDue,
  };
}

export function formatRecurrenceLabel(item: MaintenanceItem): string {
  const base = `Mỗi ${item.interval_value} ${INTERVAL_UNIT_LABELS[item.interval_unit]}`;
  if (item.recurrence_mode === 'USAGE_BASED' && item.interval_km) {
    return `${base} hoặc ${item.interval_km.toLocaleString('vi-VN')} km`;
  }
  if (item.recurrence_mode === 'FIXED_CALENDAR') {
    return `${base} (cố định)`;
  }
  return base;
}

export function formatDueCountdown(daysUntilDue: number, isOdoDue = false): string {
  if (isOdoDue && daysUntilDue > 0) {
    return 'Đã vượt ngưỡng km';
  }
  if (daysUntilDue < 0) {
    return `Quá hạn ${Math.abs(daysUntilDue)} ngày`;
  }
  if (daysUntilDue === 0) {
    return 'Đến hạn hôm nay';
  }
  if (daysUntilDue === 1) {
    return 'Ngày mai';
  }
  return `Còn ${daysUntilDue} ngày`;
}

export interface MaintenanceTemplate {
  key: string;
  title: string;
  category: MaintenanceCategory;
  recurrence_mode: MaintenanceRecurrenceMode;
  interval_value: number;
  interval_unit: MaintenanceIntervalUnit;
  remind_before_days: number;
  interval_km?: number;
  estimated_cost?: number;
  auto_renew?: boolean;
  notes?: string;
}

export const MAINTENANCE_TEMPLATES: MaintenanceTemplate[] = [
  {
    key: 'haircut',
    title: 'Cắt tóc',
    category: 'PERSONAL_CARE',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 30,
    interval_unit: 'DAY',
    remind_before_days: 3,
    estimated_cost: 120000,
    notes: 'Ghi chú kiểu tóc & thợ quen để lần sau dễ đặt lịch.',
  },
  {
    key: 'bedding',
    title: 'Giặt chăn ga, vỏ gối',
    category: 'LAUNDRY',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 14,
    interval_unit: 'DAY',
    remind_before_days: 2,
    notes: 'Thay vỏ gối, ga trải giường định kỳ giúp ngủ ngon và sạch da.',
  },
  {
    key: 'room-clean',
    title: 'Tổng vệ sinh phòng',
    category: 'CLEANING',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 7,
    interval_unit: 'DAY',
    remind_before_days: 1,
    notes: 'Lau bàn làm việc, hút bụi, lau sàn và dọn góc phòng.',
  },
  {
    key: 'vehicle-oil',
    title: 'Thay nhớt & bảo dưỡng xe',
    category: 'VEHICLE',
    recurrence_mode: 'USAGE_BASED',
    interval_value: 3,
    interval_unit: 'MONTH',
    remind_before_days: 7,
    interval_km: 1500,
    estimated_cost: 180000,
    notes: 'Kiểm tra nhớt máy, nhớt lap, áp suất lốp và phanh.',
  },
  {
    key: 'laptop-clean',
    title: 'Vệ sinh laptop & keo tản nhiệt',
    category: 'TECH',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 6,
    interval_unit: 'MONTH',
    remind_before_days: 7,
    estimated_cost: 200000,
    notes: 'Thổi bụi quạt gió, lau màn hình, kiểm tra pin & backup dữ liệu.',
  },
  {
    key: 'health-check',
    title: 'Khám sức khỏe tổng quát',
    category: 'HEALTH',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 12,
    interval_unit: 'MONTH',
    remind_before_days: 14,
    estimated_cost: 1500000,
    notes: 'Xét nghiệm máu, siêu âm, kiểm tra các chỉ số cơ bản.',
  },
  {
    key: 'dental-check',
    title: 'Lấy cao răng & khám nha khoa',
    category: 'HEALTH',
    recurrence_mode: 'AFTER_COMPLETION',
    interval_value: 6,
    interval_unit: 'MONTH',
    remind_before_days: 7,
    estimated_cost: 300000,
    notes: 'Khám răng định kỳ 6 tháng/lần.',
  },
  {
    key: 'subscription-renew',
    title: 'Gia hạn dịch vụ (iCloud / Spotify)',
    category: 'SUBSCRIPTION',
    recurrence_mode: 'FIXED_CALENDAR',
    interval_value: 1,
    interval_unit: 'MONTH',
    remind_before_days: 3,
    estimated_cost: 59000,
    auto_renew: true,
    notes: 'Rà soát trước ngày trừ tiền xem còn nhu cầu sử dụng không.',
  },
];
