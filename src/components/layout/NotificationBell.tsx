'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useGlobalNotifications } from '@/hooks/useNotifications';
import { formatDateVN } from '@/lib/utils';
import type { NotificationReminder } from '@/types/database';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [], isLoading } = useGlobalNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const urgentCount = notifications.filter((n) => n.severity === 'urgent').length;
  const warningCount = notifications.filter((n) => n.severity === 'warning').length;
  const totalCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-[#1e3a2f] hover:border-[#1e3a2f]/40 dark:hover:text-emerald-400 transition-all cursor-pointer shadow-2xs"
        aria-label="Thông báo & Nhắc lịch"
        title="Thông báo & Nhắc lịch đến hạn"
      >
        <Bell className={`h-4 w-4 ${totalCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`} />

        {/* Badge counter */}
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs ${
              urgentCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
            }`}
          >
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4 shadow-2xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                Nhắc lịch & Đến hạn ({totalCount})
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List items */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-stone-400">Đang kiểm tra lịch nhắc...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Không có lịch nhắc nào cần xử lý!
                </p>
                <p className="text-[11px] text-stone-400">
                  Tất cả việc vệ sinh, hoá đơn và hạn bảo hành đều trong tầm kiểm soát.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUrgent = item.severity === 'urgent';
                const isWarning = item.severity === 'warning';

                return (
                  <Link
                    key={item.id}
                    href={item.linkHref}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 rounded-xl border transition-all hover:scale-[1.01] ${
                      isUrgent
                        ? 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900/50'
                        : isWarning
                        ? 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/50'
                        : 'border-stone-200 bg-stone-50/50 dark:bg-stone-900/40 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex-shrink-0">
                        {isUrgent ? (
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        ) : isWarning ? (
                          <Clock className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                          {item.description}
                        </p>
                        {item.dueDate && (
                          <p className="text-[10px] font-semibold text-stone-400 pt-0.5">
                            Hạn: {formatDateVN(item.dueDate)}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-stone-400 flex-shrink-0 self-center" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
