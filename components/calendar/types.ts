// Common types for calendar components
export interface Subscription {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  startDate: string;
  interval: string;
  reminder: string;
  createdAt: string;
}

export interface UpcomingPayment {
  date: string;
  subscriptions: Subscription[];
}

export type ViewMode = 'calendar' | 'list';

// Currency symbols map
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

// Orange brand color
export const ORANGE_COLOR = '#FF8000';
