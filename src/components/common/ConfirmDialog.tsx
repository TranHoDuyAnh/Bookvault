'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center pt-1">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${
            isDestructive
              ? 'bg-destructive-subtle text-destructive'
              : 'bg-warning-subtle text-warning'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-text-muted">
          {description}
        </p>

        <div className="mt-6 flex w-full gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
