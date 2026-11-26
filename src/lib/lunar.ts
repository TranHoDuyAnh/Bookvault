/**
 * Lightweight Vietnamese Lunar Date helper using built-in ICU Chinese calendar
 * (accurate for standard daily display in Asia/Ho_Chi_Minh).
 */
export interface LunarDateInfo {
  day: number;
  month: number;
  year: number;
  formatted: string;
  isSpecialDay: boolean;
  specialLabel: string | null;
}

export function getLunarDateInfo(date: Date = new Date()): LunarDateInfo {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-chinese', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(date);
    const dayPart = parts.find((p) => p.type === 'day')?.value || '1';
    const monthPart = parts.find((p) => p.type === 'month')?.value || '1';
    const yearPart =
      parts.find((p) => String(p.type) === 'relatedYear' || p.type === 'year')?.value ||
      String(date.getFullYear());

    const day = parseInt(dayPart, 10) || 1;
    const month = parseInt(monthPart.replace(/\D/g, ''), 10) || 1;
    const isLeap = monthPart.toLowerCase().includes('bis') || monthPart.includes('leap');
    const year = parseInt(yearPart, 10) || date.getFullYear();

    let specialLabel: string | null = null;
    if (day === 1) specialLabel = 'Mùng 1 Âm lịch';
    else if (day === 15) specialLabel = 'Ngày Rằm';
    else if (month === 1 && day <= 3) specialLabel = 'Tết Nguyên Đán';
    else if (month === 8 && day === 15) specialLabel = 'Tết Trung Thu';

    return {
      day,
      month,
      year,
      formatted: `${day}/${month}${isLeap ? ' (nhuận)' : ''} Âm lịch`,
      isSpecialDay: specialLabel !== null,
      specialLabel,
    };
  } catch {
    return {
      day: 1,
      month: 1,
      year: date.getFullYear(),
      formatted: 'Âm lịch',
      isSpecialDay: false,
      specialLabel: null,
    };
  }
}

export function getHcmcQuoteDayInfo(now: Date = new Date()): {
  dayIndex: number;
  dayKey: string;
} {
  // Anchor rollover to 08:00 AM Asia/Ho_Chi_Minh (UTC+7): +7h - 8h = -1h from UTC
  const shifted = new Date(now.getTime() - 60 * 60 * 1000);
  const dayIndex = Math.floor(shifted.getTime() / 86_400_000);
  const dayKey = shifted.toISOString().slice(0, 10);
  return { dayIndex, dayKey };
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PeriodMeta {
  period: DayPeriod;
  label: string;
  greeting: string;
  subtitle: string;
  gradientClass: string;
}

export function getHcmcPeriodMeta(hour: number): PeriodMeta {
  if (hour >= 5 && hour < 12) {
    return {
      period: 'morning',
      label: 'Buổi sáng',
      greeting: 'Chào buổi sáng',
      subtitle: 'Khởi đầu ngày mới nhẹ nhàng tại TP. Hồ Chí Minh.',
      gradientClass: 'from-amber-950/75 via-stone-900/55 to-black/75',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      period: 'afternoon',
      label: 'Buổi chiều',
      greeting: 'Chào buổi chiều',
      subtitle: 'Cập nhật nhanh thời tiết và nhịp sống Sài Gòn.',
      gradientClass: 'from-sky-950/75 via-slate-900/55 to-black/75',
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      period: 'evening',
      label: 'Buổi tối',
      greeting: 'Chào buổi tối',
      subtitle: 'Chiều muộn ở TP.HCM — thư giãn sau một ngày làm việc.',
      gradientClass: 'from-orange-950/80 via-zinc-900/60 to-black/80',
    };
  }
  return {
    period: 'night',
    label: 'Đêm muộn',
    greeting: 'Chúc ngủ ngon',
    subtitle: 'Thành phố đã lên đèn — nghỉ ngơi cho ngày mai thật khoẻ.',
    gradientClass: 'from-indigo-950/85 via-zinc-950/70 to-black/90',
  };
}
