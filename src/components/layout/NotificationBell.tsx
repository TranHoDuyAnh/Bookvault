'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
} from 'lucide-react';
import { useGlobalNotifications } from '@/hooks/useNotifications';
import { formatDateVN } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [], isLoading } = useGlobalNotifications();

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
  const totalCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-text-secondary hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        aria-label="Thông báo & Nhắc lịch"
        title="Thông báo & Nhắc lịch đến hạn"
      >
        <Bell className="h-4 w-4" />

        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-semibold text-white tabular-nums ${
              urgentCount > 0 ? 'bg-destructive' : 'bg-primary text-primary-foreground'
            }`}
          >
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-text-secondary" />
              <h3 className="font-semibold text-sm text-foreground">
                Nhắc lịch & Đến hạn ({totalCount})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-text-muted hover:bg-accent hover:text-foreground"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-0.5">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-text-muted">
                Đang kiểm tra lịch nhắc...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <CheckCircle2 className="h-7 w-7 text-success mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  Không có lịch nhắc nào cần xử lý
                </p>
                <p className="text-xs text-text-muted">
                  Không có sự kiện nào sắp tới trong 7 ngày tới.
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
                    className="block p-3 rounded-lg border border-border bg-card hover:bg-accent/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isUrgent ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : isWarning ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-info" />
                        )}
                      </div>

                      <div className="flex-1 space-y-0.5 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-text-muted leading-snug">
                          {item.description}
                        </p>
                        {item.dueDate && (
                          <p className="text-[11px] text-text-muted pt-0.5 tabular-nums">
                            Hạn: {formatDateVN(item.dueDate)}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-text-muted shrink-0 self-center" />
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
