import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookStatus, BookImageType } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeVN(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export const STATUS_CONFIG: Record<
  BookStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  WISHLIST: {
    label: 'Muốn đọc',
    bg: 'bg-warning-subtle',
    text: 'text-warning',
    border: 'border-warning/25',
    dot: 'bg-warning',
  },
  OWNED: {
    label: 'Đang sở hữu',
    bg: 'bg-secondary',
    text: 'text-text-secondary',
    border: 'border-border',
    dot: 'bg-text-muted',
  },
  READING: {
    label: 'Đang đọc',
    bg: 'bg-info-subtle',
    text: 'text-info',
    border: 'border-info/25',
    dot: 'bg-info',
  },
  READ: {
    label: 'Đã đọc',
    bg: 'bg-success-subtle',
    text: 'text-success',
    border: 'border-success/25',
    dot: 'bg-success',
  },
  DROPPED: {
    label: 'Đã bỏ',
    bg: 'bg-destructive-subtle',
    text: 'text-destructive',
    border: 'border-destructive/25',
    dot: 'bg-destructive',
  },
};

export const IMAGE_TYPE_LABELS: Record<BookImageType, string> = {
  COVER: 'Bìa trước',
  BACK_COVER: 'Bìa sau',
  SPINE: 'Gáy sách',
  ISBN: 'Mã vạch / ISBN',
  OTHER: 'Khác',
};
