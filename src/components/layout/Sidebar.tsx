'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Settings,
  Plus,
  LogOut,
  Search,
  Tv,
  CalendarHeart,
  Sunrise,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false);

  const bookNavItems = [
    { name: 'Tổng quan', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Thư viện sách', href: '/app/library', icon: Library },
  ];

  const lifestyleNavItems = [
    { name: 'Bản tin mỗi ngày', href: '/app/morning', icon: Sunrise },
    { name: 'Giải trí & Văn hoá', href: '/app/entertainment', icon: Tv },
    { name: 'Ngày quan trọng', href: '/app/dates', icon: CalendarHeart },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col justify-between border-r border-border bg-sidebar text-sidebar-foreground min-h-screen shrink-0 transition-[width] duration-150',
        collapsed ? 'w-16 p-2' : 'w-60 p-3'
      )}
    >
      <div className="space-y-5 max-h-[calc(100vh-110px)] overflow-y-auto">
        {/* Brand Header & Collapse Toggle */}
        <div className={cn('flex items-center pt-1', collapsed ? 'justify-center' : 'justify-between px-1.5')}>
          <Link href="/app/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-sm font-semibold tracking-tight text-foreground block leading-tight truncate">
                  HomeBase
                </span>
                <span className="text-[11px] text-text-muted block truncate">
                  Personal OS
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors"
              title="Thu gọn thanh bên"
              aria-label="Thu gọn thanh bên"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="rounded-md p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors"
              title="Mở rộng thanh bên"
              aria-label="Mở rộng thanh bên"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-1.5">
          <Button
            onClick={onOpenAddModal}
            size={collapsed ? 'icon' : 'sm'}
            className={cn('w-full', collapsed && 'mx-auto')}
            title="Thêm sách mới"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Thêm sách mới</span>}
          </Button>

          <button
            type="button"
            onClick={onOpenSearchModal}
            title="Tra cứu tại nhà sách (⌘K)"
            className={cn(
              'w-full flex items-center rounded-md border border-border bg-card hover:bg-accent text-text-muted hover:text-foreground transition-colors cursor-pointer h-8',
              collapsed ? 'justify-center px-0' : 'justify-between px-2.5 text-xs'
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span className="truncate">Tra cứu nhanh</span>}
            </span>
            {!collapsed && (
              <kbd className="text-[10px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded text-text-muted">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* Section 1: Books */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[11px] font-medium text-text-muted px-2.5 block">
              Tủ sách số
            </span>
          )}
          <nav className="space-y-0.5">
            {bookNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/app/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  data-active={isActive}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md min-h-9 px-2.5 py-1.5 text-[13px] transition-colors duration-150',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-text-secondary hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Lifestyle */}
        <div className="space-y-1 pt-2 border-t border-border">
          {!collapsed && (
            <span className="text-[11px] font-medium text-text-muted px-2.5 block">
              Phong cách sống
            </span>
          )}
          <nav className="space-y-0.5">
            {lifestyleNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  data-active={isActive}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md min-h-9 px-2.5 py-1.5 text-[13px] transition-colors duration-150',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-text-secondary hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / User Profile & Settings */}
      <div className="space-y-1.5 pt-3 border-t border-border">
        <Link
          href="/app/settings"
          title={collapsed ? 'Cài đặt tài khoản' : undefined}
          data-active={pathname === '/app/settings'}
          className={cn(
            'flex items-center gap-2.5 rounded-md min-h-9 px-2.5 py-1.5 text-[13px] transition-colors duration-150',
            collapsed && 'justify-center px-0',
            pathname === '/app/settings'
              ? 'bg-secondary text-foreground font-medium'
              : 'text-text-secondary hover:bg-accent hover:text-foreground'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Cài đặt</span>}
        </Link>

        <div
          className={cn(
            'flex items-center rounded-md bg-card p-2 border border-border',
            collapsed ? 'justify-center' : 'justify-between gap-2'
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-xs shrink-0 border border-border">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <p className="text-xs font-medium text-foreground truncate">
                {profile?.display_name || user?.email?.split('@')[0] || 'Độc giả'}
              </p>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => signOut()}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="rounded-md p-1 text-text-muted hover:bg-destructive-subtle hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
