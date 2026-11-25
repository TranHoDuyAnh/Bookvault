import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
  isLoading?: boolean;
  valueClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  isLoading = false,
  valueClassName,
  className,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card backdrop-blur-xl p-4 sm:p-5 shadow-[var(--glass-shadow)] transition-all duration-150 space-y-1.5',
        href && 'hover:border-primary/40 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between text-text-muted">
        <span className="text-[13px] font-medium">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div
        className={cn(
          'text-[28px] font-semibold leading-tight tracking-tight text-foreground tabular-nums',
          valueClassName
        )}
      >
        {isLoading ? <Skeleton className="h-8 w-16 my-0.5" /> : value}
      </div>
      {hint && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
