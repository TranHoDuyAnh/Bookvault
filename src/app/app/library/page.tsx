'use client';

import React, { useState } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { BookGrid } from '@/components/books/BookGrid';
import { BookList } from '@/components/books/BookList';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import type { BookStatus } from '@/types/database';

type SortOption = 'recently_added' | 'title' | 'author' | 'rating' | 'progress';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recently_added');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: books = [], isLoading } = useLibrary({
    search: search.trim() || undefined,
    status: statusFilter,
    sortBy,
  });

  const statusOptions: { key: BookStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'OWNED', label: 'Đang sở hữu' },
    { key: 'READING', label: 'Đang đọc' },
    { key: 'READ', label: 'Đã đọc' },
    { key: 'WISHLIST', label: 'Muốn đọc' },
    { key: 'DROPPED', label: 'Đã bỏ' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thư viện của tôi"
        description={`Quản lý ấn bản vật lý và bộ sưu tập sách cá nhân (${books.length} cuốn)`}
        actions={
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
              title="Dạng lưới"
              aria-label="Dạng lưới"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
              title="Dạng danh sách"
              aria-label="Dạng danh sách"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm kiếm theo tên sách, tác giả hoặc ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2 sm:w-auto justify-end">
            <span className="text-[13px] text-text-muted whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full sm:w-48"
            >
              <option value="recently_added">Mới thêm vào tủ</option>
              <option value="title">Tên sách A-Z</option>
              <option value="author">Tên tác giả A-Z</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="progress">Tiến độ đọc cao nhất</option>
            </Select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setStatusFilter(opt.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-text-secondary hover:bg-accent hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <BookGrid books={books} isLoading={isLoading} />
      ) : (
        <BookList books={books} isLoading={isLoading} />
      )}
    </div>
  );
}
