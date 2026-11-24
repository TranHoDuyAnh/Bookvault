'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Search, BookCheck, Plus, Sparkles, CheckCircle2, DollarSign, MapPin, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';
import { useUser } from '@/hooks/useUser';
import { searchGlobalBooks } from '@/services/books';
import { getUserLibrary } from '@/services/library';
import type { MyLibraryItem, Book } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';

export function BookSearchModal({
  isOpen,
  onClose,
  onOpenAddModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal?: (prefill?: Partial<Book>) => void;
}) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [userBooksResults, setUserBooksResults] = useState<MyLibraryItem[]>([]);
  const [globalBooksResults, setGlobalBooksResults] = useState<Book[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUserBooksResults([]);
      setGlobalBooksResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        // 1. Search in user's personal library
        if (user?.id) {
          const userBooks = await getUserLibrary(user.id, { search: searchTerm });
          setUserBooksResults(userBooks);
        }

        // 2. Search in global catalog
        const globalBooks = await searchGlobalBooks(searchTerm);
        // Exclude books already in user's library
        const filteredGlobal = globalBooks.filter(
          (gb) => !userBooksResults.some((ub) => ub.book_id === gb.id)
        );
        setGlobalBooksResults(filteredGlobal);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, user?.id]);

  const hasSearched = searchTerm.trim().length > 0;
  const hasUserMatches = userBooksResults.length > 0;
  const hasGlobalMatches = globalBooksResults.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-text-secondary" />
          <span>Tra cứu nhanh khi mua sách</span>
        </div>
      }
      description="Nhập tên sách, tác giả hoặc mã ISBN để kiểm tra xem bạn đã sở hữu cuốn sách này chưa."
    >
      <div className="space-y-5">
        {/* Search input */}
        <div className="relative">
          <Input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ví dụ: Atomic Habits, Clean Code, 9786045635032..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-11"
          />
        </div>

        {/* Loading */}
        {isPending && (
          <div className="py-8 text-center text-sm text-text-muted">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
            <p className="mt-2 font-medium">Đang tìm kiếm trong tủ sách và kho dữ liệu...</p>
          </div>
        )}

        {/* Results Container */}
        {!isPending && hasSearched && (
          <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
            {/* GROUP 1: In User Library */}
            {hasUserMatches && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-subtle text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-success">
                    Đã có trong tủ sách của bạn ({userBooksResults.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {userBooksResults.map((item) => {
                    const primaryImage =
                      item.images?.find((img) => img.is_primary)?.image_url ||
                      item.images?.[0]?.image_url;

                    return (
                      <div
                        key={item.id}
                        className="relative rounded-lg border border-success/40 bg-success-subtle/30 p-4 shadow-2xs"
                      >
                        {/* Duplicate Alert Banner */}
                        <div className="mb-3 flex items-center justify-between border-b border-success/20 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                            <BookCheck className="h-4 w-4" />
                            <span>Bạn đã sở hữu cuốn sách này</span>
                          </div>
                          <BookStatusBadge status={item.status} />
                        </div>

                        <div className="flex gap-4">
                          <BookCover
                            src={primaryImage}
                            title={item.title}
                            author={item.author}
                            size="sm"
                            className="w-14 h-20 sm:w-16 sm:h-24 shrink-0"
                          />

                          <div className="flex-1 space-y-1.5 text-xs min-w-0">
                            <h5 className="text-sm font-semibold text-foreground">
                              {item.title}
                            </h5>
                            <p className="text-text-secondary font-medium">
                              Tác giả: {item.author || 'Chưa rõ'}
                            </p>

                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border tabular-nums">
                              {item.purchase_store && (
                                <div className="flex items-center gap-1 text-text-secondary">
                                  <MapPin className="h-3 w-3 text-text-muted shrink-0" />
                                  <span className="truncate">Nơi mua: <strong className="text-foreground">{item.purchase_store}</strong></span>
                                </div>
                              )}
                              {item.purchase_price !== null && (
                                <div className="flex items-center gap-1 text-text-secondary">
                                  <DollarSign className="h-3 w-3 text-text-muted shrink-0" />
                                  <span>Giá: <strong className="text-foreground">{formatVND(item.purchase_price)}</strong></span>
                                </div>
                              )}
                              {item.purchase_date && (
                                <div className="flex items-center gap-1 text-text-secondary">
                                  <Calendar className="h-3 w-3 text-text-muted shrink-0" />
                                  <span>Ngày: <strong className="text-foreground">{formatDateVN(item.purchase_date)}</strong></span>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Link
                                href={`/app/library/${item.id}`}
                                onClick={onClose}
                                className="inline-flex items-center text-xs font-medium text-foreground hover:underline"
                              >
                                Xem chi tiết trong tủ sách &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GROUP 2: Global Books */}
            {hasGlobalMatches && (
              <div className="space-y-3 pt-1">
                <h4 className="px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Sách khác trong hệ thống ({globalBooksResults.length})
                </h4>

                <div className="space-y-2">
                  {globalBooksResults.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:border-ring/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookCover
                          title={b.title}
                          author={b.author}
                          size="sm"
                          className="w-10 h-14"
                        />
                        <div className="min-w-0">
                          <h5 className="text-sm font-semibold text-foreground truncate">
                            {b.title}
                          </h5>
                          <p className="text-xs text-text-muted truncate">
                            {b.author || 'Chưa rõ tác giả'} {b.release_year ? `• ${b.release_year}` : ''}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onClose();
                          onOpenAddModal?.({
                            title: b.title,
                            subtitle: b.subtitle,
                            author: b.author,
                            publisher: b.publisher,
                            isbn_10: b.isbn_10,
                            isbn_13: b.isbn_13,
                            page_count: b.page_count,
                            release_year: b.release_year,
                            description: b.description,
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No matches at all */}
            {!hasUserMatches && !hasGlobalMatches && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center bg-secondary/40">
                <p className="text-sm font-semibold text-foreground">
                  Chưa tìm thấy sách &quot;{searchTerm}&quot;
                </p>
                <p className="mt-1 text-xs text-text-muted max-w-sm mx-auto">
                  Bạn có thể tạo mới cuốn sách này và thêm ngay vào tủ sách cá nhân.
                </p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      onOpenAddModal?.({ title: searchTerm });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Tạo mới và thêm vào tủ sách
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Helper Prompt when empty */}
        {!hasSearched && (
          <div className="rounded-lg bg-secondary/70 border border-border p-4 text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-foreground">
              Mẹo tra cứu tại nhà sách
            </p>
            <p className="text-text-muted">
              Nhập tên sách hoặc số ISBN trên bìa sau để HomeBase kiểm tra ngay xem bạn đã từng mua hoặc đọc cuốn này chưa.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
