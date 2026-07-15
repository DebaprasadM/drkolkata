import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (format === 'long') return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    WAITING: 'bg-warning/10 text-warning',
    CALLED: 'bg-primary/10 text-primary',
    IN_CONSULTATION: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-success/10 text-success',
    SKIPPED: 'bg-destructive/10 text-destructive',
    PAID: 'bg-success/10 text-success',
    PENDING: 'bg-warning/10 text-warning',
    REFUNDED: 'bg-destructive/10 text-destructive',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}
