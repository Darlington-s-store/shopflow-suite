import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { storeSettings } from "@/data/mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: storeSettings.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Calculate discount percentage
export function calculateDiscount(price: number, compareAtPrice?: number): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

// Get order status color
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-warning/10 text-warning border-warning/20',
    PAID: 'bg-info/10 text-info border-info/20',
    PROCESSING: 'bg-info/10 text-info border-info/20',
    PACKED: 'bg-info/10 text-info border-info/20',
    ASSIGNED_TO_DELIVERY: 'bg-accent/10 text-accent-foreground border-accent/20',
    OUT_FOR_DELIVERY: 'bg-accent/10 text-accent-foreground border-accent/20',
    DELIVERED: 'bg-success/10 text-success border-success/20',
    DELIVERY_FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
    CANCELLED: 'bg-muted text-muted-foreground border-muted',
    REFUNDED: 'bg-muted text-muted-foreground border-muted',
  };
  return colors[status] || 'bg-muted text-muted-foreground border-muted';
}

// Get order status label
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    PAID: 'Paid',
    PROCESSING: 'Processing',
    PACKED: 'Packed',
    ASSIGNED_TO_DELIVERY: 'Assigned',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    DELIVERY_FAILED: 'Delivery Failed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
}

// Get review status color
export function getReviewStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    APPROVED: 'bg-success/10 text-success border-success/20',
    REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
    HIDDEN: 'bg-muted text-muted-foreground border-muted',
  };
  return colors[status] || 'bg-muted text-muted-foreground border-muted';
}

// Get delivery status color
export function getDeliveryStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-muted text-muted-foreground border-muted',
    ASSIGNED: 'bg-info/10 text-info border-info/20',
    PICKED_UP: 'bg-accent/10 text-accent-foreground border-accent/20',
    IN_TRANSIT: 'bg-accent/10 text-accent-foreground border-accent/20',
    DELIVERED: 'bg-success/10 text-success border-success/20',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return colors[status] || 'bg-muted text-muted-foreground border-muted';
}

// Parse search params
export function parseSearchParams(searchParams: URLSearchParams): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
