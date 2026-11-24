'use client';

import * as React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-12 text-center my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-text-muted mb-4">
        {icon || <BookOpen className="h-6 w-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
