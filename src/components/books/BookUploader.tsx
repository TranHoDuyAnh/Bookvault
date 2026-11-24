'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { IMAGE_TYPE_LABELS } from '@/lib/utils';
import type { BookImageType, BookImage } from '@/types/database';
import { uploadBookImage } from '@/services/storage';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function BookUploader({
  bookId,
  onUploaded,
}: {
  bookId: string;
  onUploaded?: (image: BookImage) => void;
}) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<BookImageType>('COVER');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);

    try {
      const uploaded = await uploadBookImage({
        userId: user.id,
        bookId,
        file: selectedFile,
        imageType,
        isPrimary,
      });

      toast.success('Đã tải ảnh lên thành công!');
      setSelectedFile(null);
      setPreviewUrl(null);
      onUploaded?.(uploaded);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải ảnh lên.';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-md border border-dashed p-5 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-secondary'
              : 'border-border hover:border-ring/60 bg-background/50'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-text-secondary mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            Kéo thả hoặc nhấn để chọn ảnh
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            Bìa sách, gáy sách hoặc mã ISBN (JPG, PNG, tối đa 10MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="relative h-36 w-24 rounded-md overflow-hidden border border-border bg-secondary shrink-0 book-shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                aria-label="Xoá ảnh đã chọn"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <Select
                label="Loại ảnh chụp"
                value={imageType}
                onChange={(e) => setImageType(e.target.value as BookImageType)}
              >
                {(Object.keys(IMAGE_TYPE_LABELS) as BookImageType[]).map((type) => (
                  <option key={type} value={type}>
                    {IMAGE_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>

              <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-input accent-primary"
                />
                <span>Đặt làm ảnh đại diện chính</span>
              </label>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Tải lên
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                  disabled={isUploading}
                >
                  Huỷ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
