import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmDialogContextType {
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export const ConfirmDialogProvider: React.FC<ConfirmDialogProviderProps> = ({ children }) => {
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setDialog({
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (dialog) {
      dialog.onConfirm();
      setDialog(null);
    }
  }, [dialog]);

  const handleCancel = useCallback(() => {
    if (dialog) {
      dialog.onCancel?.();
      setDialog(null);
    }
  }, [dialog]);

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-[#121212] rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-3">{dialog.title}</h3>
            <p className="text-[#888888] text-sm mb-6">{dialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl font-medium text-sm bg-[#1A1A1A] text-[#888888] hover:bg-[#252525] transition-colors"
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-medium text-sm bg-primary text-black hover:bg-primary/90 transition-colors"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
