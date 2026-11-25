'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Library,
  Plus,
  Menu,
  X,
  Settings,
  Tv,
  CalendarHeart,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav({ onOpenAddModal }: { onOpenAddModal: () => void }) {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainItems = [
    { name: 'Trang chủ', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Tủ sách', href: '/app/library', icon: Library },
    { name: 'Giải trí', href: '/app/entertainment', icon: Tv },
    { name: 'Ngày lễ', href: '/app/dates', icon: CalendarHeart },
  ];

  const moreItems = [
    { name: 'Ngân sách tuần', href: '/app/budget', icon: Wallet },
    { name: 'Giải trí & Văn hoá', href: '/app/entertainment', icon: Tv },
    { name: 'Ngày quan trọng', href: '/app/dates', icon: CalendarHeart },
    { name: 'Cài đặt tài khoản', href: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Floating Action Button (+) */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 lg:hidden">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover active:scale-95 transition-all cursor-pointer border border-border"
          aria-label="Thêm sách"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border bg-sidebar/95 backdrop-blur-md px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {mainItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md px-2.5 py-1 text-[11px] transition-colors',
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-text-muted hover:text-foreground font-medium'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.25]')} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-text-muted hover:text-foreground cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {/* More Hubs Drawer Modal */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-[2px] flex items-end">
          <div className="w-full bg-card text-card-foreground rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto border-t border-border shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-base text-foreground">
                Menu HomeBase
              </h3>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-md text-text-muted hover:bg-accent hover:text-foreground"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/40 hover:bg-accent transition-colors text-sm font-medium text-foreground"
                >
                  <item.icon className="h-4 w-4 text-text-secondary shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
