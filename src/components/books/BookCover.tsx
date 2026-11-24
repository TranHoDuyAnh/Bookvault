'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BookCoverProps {
  src?: string | null;
  title: string;
  author?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fill';
  aspectRatio?: 'book' | 'square';
}

const COLOR_PALETTES = [
  { bg: 'bg-zinc-900', text: 'text-zinc-50', border: 'border-zinc-800' },
  { bg: 'bg-zinc-800', text: 'text-zinc-50', border: 'border-zinc-700' },
  { bg: 'bg-neutral-800', text: 'text-neutral-50', border: 'border-neutral-700' },
  { bg: 'bg-stone-800', text: 'text-stone-50', border: 'border-stone-700' },
  { bg: 'bg-slate-800', text: 'text-slate-50', border: 'border-slate-700' },
  { bg: 'bg-zinc-700', text: 'text-zinc-50', border: 'border-zinc-600' },
];

export function BookCover({
  src,
  title,
  author,
  className,
  size = 'md',
  aspectRatio = 'book',
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);

  const paletteIndex = title
    ? Math.abs(
        title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % COLOR_PALETTES.length
    : 0;
  const palette = COLOR_PALETTES[paletteIndex];

  const sizeClasses = {
    sm: 'w-14 h-20 text-[10px]',
    md: 'w-24 h-36 sm:w-28 sm:h-40 text-xs',
    lg: 'w-36 h-52 sm:w-44 sm:h-64 text-sm',
    xl: 'w-48 h-72 sm:w-60 sm:h-88 text-base',
    fill: 'w-full h-full text-sm',
  };

  const aspectClass = aspectRatio === 'book' ? 'aspect-[2/3]' : 'aspect-square';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md transition-transform duration-150 select-none book-shadow shrink-0',
        size !== 'fill' && sizeClasses[size],
        aspectClass,
        className
      )}
    >
      {/* Subtle book spine edge */}
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 via-black/10 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-[1px] bg-white/20 z-10 pointer-events-none" />

      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full flex-col justify-between p-2.5 sm:p-3 border text-left',
            palette.bg,
            palette.text,
            palette.border
          )}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-1.5 opacity-80">
            <span className="text-[9px] uppercase tracking-wider font-medium line-clamp-1">
              {author || 'HomeBase'}
            </span>
            <BookOpen className="h-3 w-3 opacity-70 shrink-0" />
          </div>

          <div className="my-auto py-1">
            <p className="font-semibold leading-tight line-clamp-3">
              {title}
            </p>
          </div>

          <div className="border-t border-white/15 pt-1 opacity-75">
            <p className="text-[9px] line-clamp-1">
              {author || 'Ấn bản cá nhân'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
