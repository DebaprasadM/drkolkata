'use client';

import { ToastProvider, ToastViewport } from '@/components/ui/toast';

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
