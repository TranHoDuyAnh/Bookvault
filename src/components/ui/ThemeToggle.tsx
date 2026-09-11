'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('h-9 w-9 rounded-full border border-stone-200 dark:border-stone-800 bg-transparent', className)} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer',
        className
      )}
      title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      aria-label="Đổi giao diện sáng/tối"
    >
      <Sun
        className={cn(
          'h-4 w-4 text-amber-500 transition-all duration-300',
          isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'h-4 w-4 text-indigo-400 transition-all duration-300',
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
        )}
      />
    </button>
  );
}
