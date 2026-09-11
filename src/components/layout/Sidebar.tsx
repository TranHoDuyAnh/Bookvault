'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Flame,
  Heart,
  Bookmark,
  Tag as TagIcon,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  Utensils,
  Home,
  Gift,
  Package,
  Car,
  Wrench,
  Zap,
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
import { useUser } from '@/hooks/useUser';
import { signOut } from '@/services/auth';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  onOpenAddModal: () => void;
  onOpenSearchModal: () => void;
}

export function Sidebar({ onOpenAddModal, onOpenSearchModal }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useUser();

  const bookNavItems = [
    { name: 'Tổng quan', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Thư viện sách', href: '/app/library', icon: Library },
    { name: 'Đang đọc', href: '/app/reading', icon: Flame },
    { name: 'Muốn đọc', href: '/app/wishlist', icon: Heart },
    { name: 'Ghi chú & Trích dẫn', href: '/app/notes', icon: Bookmark },
  ];

  const homeNavItems = [
    { name: 'Đồ đạc trong nhà', href: '/app/home', icon: Home },
    { name: 'Lịch vệ sinh', href: '/app/cleaning', icon: Sparkles, badge: 'Chu kỳ' },
    { name: 'Sửa chữa bảo trì', href: '/app/maintenance', icon: Wrench },
    { name: 'Hoá đơn định kỳ', href: '/app/utilities', icon: Zap, badge: 'Điện/Nước' },
  ];

  const vehicleAndAssetNavItems = [
    { name: 'Quản lý tài sản', href: '/app/assets', icon: Package },
    { name: 'Xe & Xăng cộ', href: '/app/vehicles', icon: Car, badge: 'Đăng kiểm' },
    { name: 'Lịch sử dịch vụ', href: '/app/services', icon: Wrench },
  ];

  const financeNavItems = [
    { name: 'Budget Tracker', href: '/app/budget', icon: TrendingUp },
    { name: 'Mục tiêu tiết kiệm', href: '/app/savings', icon: PiggyBank },
  ];

  const lifestyleNavItems = [
    { name: 'Habit Tracker', href: '/app/habits', icon: CheckSquare, color: 'text-emerald-700 dark:text-emerald-400' },
    { name: 'Nhật ký cá nhân', href: '/app/journal', icon: BookMarked, color: 'text-violet-600 dark:text-violet-400' },
    { name: 'Mục tiêu & OKR', href: '/app/goals', icon: Target, color: 'text-amber-600 dark:text-amber-400' },
    { name: 'Danh sách mua sắm', href: '/app/shopping', icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Giải trí & Văn hoá', href: '/app/entertainment', icon: Tv, color: 'text-rose-600 dark:text-rose-400' },
    { name: 'Ngày quan trọng', href: '/app/dates', icon: CalendarHeart, color: 'text-pink-600 dark:text-pink-400' },
    { name: 'Food Diary', href: '/app/food', icon: Utensils, color: 'text-emerald-700 dark:text-emerald-400' },
    { name: 'Mystery Box', href: '/app/mystery', icon: Gift, color: 'text-amber-600 dark:text-amber-400', badge: 'Mỗi ngày' },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#e7e2d9] bg-[#faf8f5] dark:border-stone-800 dark:bg-stone-950 p-3 min-h-screen">
      <div className="space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
        {/* Logo & Tagline */}
        <div className="px-2 pt-1">
          <Link href="/app/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e3a2f] text-white shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
                BookVault
              </span>
              <span className="text-[9px] text-stone-500 font-medium block">
                Never buy the same book twice
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Add CTA */}
        <div className="px-1 space-y-1.5">
          <Button
            onClick={onOpenAddModal}
            className="w-full gap-2 font-semibold shadow-xs text-xs h-9"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm sách mới
          </Button>

          <button
            onClick={onOpenSearchModal}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-lg border border-[#dcd6ca] bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-emerald-700" />
              Tra cứu tại nhà sách
            </span>
            <kbd className="text-[9px] font-mono bg-stone-100 px-1 rounded text-stone-400">⌘K</kbd>
          </button>
        </div>

        {/* Section 1: Books */}
        <div className="space-y-0.5 px-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-0.5">
            Tủ Sách Số
          </span>
          <nav className="space-y-0.5">
            {bookNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#1e3a2f] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Home & Living */}
        <div className="space-y-0.5 px-1 pt-1 border-t border-[#e7e2d9] dark:border-stone-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-0.5 pt-0.5">
            Nhà Cửa & Sinh Hoạt
          </span>
          <nav className="space-y-0.5">
            {homeNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#1e3a2f] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-stone-200/80 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Vehicles & Assets */}
        <div className="space-y-0.5 px-1 pt-1 border-t border-[#e7e2d9] dark:border-stone-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-0.5 pt-0.5">
            Tài Sản & Phương Tiện
          </span>
          <nav className="space-y-0.5">
            {vehicleAndAssetNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#1e3a2f] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 4: Finance */}
        <div className="space-y-0.5 px-1 pt-1 border-t border-[#e7e2d9] dark:border-stone-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-0.5 pt-0.5">
            Tài Chính
          </span>
          <nav className="space-y-0.5">
            {financeNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#1e3a2f] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 5: Lifestyle */}
        <div className="space-y-0.5 px-1 pt-1 border-t border-[#e7e2d9] dark:border-stone-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-0.5 pt-0.5">
            Phong Cách Sống
          </span>
          <nav className="space-y-0.5">
            {lifestyleNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#1e3a2f] text-white shadow-xs'
                      : 'text-stone-700 hover:bg-[#f3eee7] hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={cn('h-3.5 w-3.5', !isActive && item.color)} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / User Profile & Settings */}
      <div className="space-y-1.5 px-1 pt-2 border-t border-[#e7e2d9] dark:border-stone-800">
        <Link
          href="/app/settings"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
            pathname === '/app/settings'
              ? 'bg-[#1e3a2f] text-white'
              : 'text-stone-700 hover:bg-[#f3eee7] dark:text-stone-300'
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Cài đặt tài khoản</span>
        </Link>

        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-stone-900 p-2 border border-[#e7e2d9] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e3a2f]/15 text-[#1e3a2f] font-serif font-bold text-xs flex-shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-stone-900 dark:text-stone-100 truncate">
                {profile?.display_name || user?.email?.split('@')[0] || 'Độc giả'}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Đăng xuất"
            className="rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
