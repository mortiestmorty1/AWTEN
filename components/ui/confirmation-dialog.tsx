'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from '@/components/ui/icons/dashboard';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                variant === 'destructive' ? 'bg-red-100' : 'bg-awten-100'
              }`}
            >
              <AlertTriangleIcon
                className={`w-5 h-5 ${
                  variant === 'destructive' ? 'text-red-600' : 'text-awten-600'
                }`}
              />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-awten-dark-900">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-awten-dark-600 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
            color="primary"
            size="medium"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            color={variant === 'destructive' ? 'alert' : 'primary'}
            size="medium"
            variant="solid"
            className="w-full sm:w-auto"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy usage
export function useConfirmationDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel?: () => void;
    loading?: boolean;
  } | null>(null);

  const confirm = (config: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
  }) => {
    setConfig({
      ...config,
      onConfirm: async () => {
        try {
          await config.onConfirm();
        } catch (error) {
          console.error('Confirmation action failed:', error);
        }
      }
    });
    setOpen(true);
  };

  const ConfirmationDialogComponent = config ? (
    <ConfirmationDialog
      open={open}
      onOpenChange={setOpen}
      title={config.title}
      description={config.description}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
      onConfirm={config.onConfirm}
      onCancel={config.onCancel}
      loading={config.loading}
    />
  ) : null;

  return {
    confirm,
    ConfirmationDialog: ConfirmationDialogComponent
  };
}
