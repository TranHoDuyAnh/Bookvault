'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Library,
  Utensils,
  Home,
  Plus,
  Menu,
  X,
  Sparkles,
  Zap,
  Car,
  Package,
  Wrench,
  Gift,
  Settings,
  TrendingUp,
  PiggyBank,
  CheckSquare,
  BookMarked,
  Target,
  ShoppingCart,
  Tv,
  CalendarHeart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav({ onOpenAddModal }: { onOpenAddModal: () => void }) {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainItems = [
    { name: 'Trang chủ', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Tủ sách', href: '/app/library', icon: Library },
    { name: 'Food', href: '/app/food', icon: Utensils },
    { name: 'Home', href: '/app/home', icon: Home },
  ];

  const moreItems = [
    { name: 'Budget Tracker', href: '/app/budget', icon: TrendingUp, color: 'text-emerald-700' },
    { name: 'Mục tiêu tiết kiệm', href: '/app/savings', icon: PiggyBank, color: 'text-teal-700' },
    { name: 'Habit Tracker', href: '/app/habits', icon: CheckSquare, color: 'text-emerald-600' },
    { name: 'Nhật ký cá nhân', href: '/app/journal', icon: BookMarked, color: 'text-violet-600' },
    { name: 'Mục tiêu & OKR', href: '/app/goals', icon: Target, color: 'text-amber-600' },
    { name: 'Danh sách mua sắm', href: '/app/shopping', icon: ShoppingCart, color: 'text-blue-600' },
    { name: 'Giải trí & Văn hoá', href: '/app/entertainment', icon: Tv, color: 'text-rose-600' },
    { name: 'Ngày quan trọng', href: '/app/dates', icon: CalendarHeart, color: 'text-pink-600' },
    { name: 'Lịch vệ sinh (Chu kỳ)', href: '/app/cleaning', icon: Sparkles, color: 'text-emerald-700' },
    { name: 'Hoá đơn định kỳ (Điện/Nước)', href: '/app/utilities', icon: Zap, color: 'text-amber-600' },
    { name: 'Xe & Xăng cộ (Đăng kiểm)', href: '/app/vehicles', icon: Car, color: 'text-blue-700' },
    { name: 'Quản lý tài sản', href: '/app/assets', icon: Package, color: 'text-indigo-700' },
    { name: 'Sửa chữa & Bảo trì nhà', href: '/app/maintenance', icon: Wrench, color: 'text-stone-700' },
    { name: 'Lịch sử dịch vụ', href: '/app/services', icon: Wrench, color: 'text-stone-700' },
    { name: 'Mystery Box (Nhiệm vụ)', href: '/app/mystery', icon: Gift, color: 'text-purple-700' },
    { name: 'Cài đặt tài khoản', href: '/app/settings', icon: Settings, color: 'text-stone-500' },
  ];

  return (
    <>
      {/* Mobile Floating Action Button (+) */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <button
          onClick={onOpenAddModal}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#1e3a2f] text-white shadow-xl hover:bg-[#284f40] active:scale-95 transition-all cursor-pointer ring-4 ring-white dark:ring-stone-900"
          aria-label="Thêm sách"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[#e7e2d9] bg-[#faf8f5]/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 px-2 py-1.5 shadow-lg">
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
                  'flex flex-col items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-[#1e3a2f] dark:text-emerald-400 font-bold scale-105'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* More menu trigger */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {/* More Hubs Drawer Modal */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex items-end">
          <div className="w-full bg-white dark:bg-stone-950 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Tất cả các tính năng Life OS
              </h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:border-[#1e3a2f] transition-all text-xs font-semibold text-stone-800 dark:text-stone-200"
                >
                  <item.icon className={cn('h-4 w-4 flex-shrink-0', item.color)} />
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
