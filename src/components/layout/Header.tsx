'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUser } from '@/hooks/useUser';

interface HeaderProps {
  onOpenSearchModal: () => void;
  onOpenAddModal: () => void;
}

export function Header({ onOpenSearchModal, onOpenAddModal }: HeaderProps) {
  const { user, profile } = useUser();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearchModal]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md pt-[env(safe-area-inset-top)] transition-colors">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6">
      {/* Mobile Logo */}
      <Link href="/app/dashboard" className="flex items-center gap-2 lg:hidden shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">
          HomeBase
        </span>
      </Link>

      {/* Instant Bookstore Search Bar Trigger */}
      <div className="flex-1 min-w-0 max-w-md">
        <button
          type="button"
          onClick={onOpenSearchModal}
          className="group flex h-9 w-full min-w-0 items-center justify-between rounded-md border border-border bg-card px-2.5 sm:px-3 text-[13px] text-text-muted hover:border-ring/60 hover:text-foreground transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate sm:hidden">Tra cứu sách...</span>
            <span className="truncate hidden sm:inline">Tra cứu sách (tên, tác giả, ISBN)...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center rounded bg-secondary border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-muted shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <ThemeToggle />
        <NotificationBell />

        <Button
          onClick={onOpenAddModal}
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm sách
        </Button>

        <Link
          href="/app/settings"
          title="Cài đặt tài khoản"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-xs border border-border hover:bg-accent transition-colors"
        >
          {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </Link>
      </div>
      </div>
    </header>
  );
}
