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
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  AlertTriangleIcon
} from '@/components/ui/icons/dashboard';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  buttonText?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  buttonText = 'OK',
  variant = 'info',
  onClose
}: AlertDialogProps) {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const getIconAndColors = () => {
    switch (variant) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonColor: 'primary' as const
        };
      case 'error':
        return {
          icon: AlertCircleIcon,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'alert' as const
        };
      case 'warning':
        return {
          icon: AlertTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonColor: 'primary' as const
        };
      default:
        return {
          icon: InfoIcon,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonColor: 'primary' as const
        };
    }
  };

  const { icon: Icon, iconBg, iconColor, buttonColor } = getIconAndColors();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
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
        <DialogFooter>
          <Button
            onClick={handleClose}
            color={buttonColor}
            size="medium"
            variant="solid"
            className="w-full sm:w-auto"
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy usage
export function useAlertDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    description: string;
    buttonText?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    onClose?: () => void;
  } | null>(null);

  const alert = (config: {
    title: string;
    description: string;
    buttonText?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    onClose?: () => void;
  }) => {
    setConfig(config);
    setOpen(true);
  };

  const AlertDialogComponent = config ? (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title={config.title}
      description={config.description}
      buttonText={config.buttonText}
      variant={config.variant}
      onClose={config.onClose}
    />
  ) : null;

  return {
    alert,
    AlertDialog: AlertDialogComponent
  };
}
