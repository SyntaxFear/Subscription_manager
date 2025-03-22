// Orange brand color
export const ORANGE_COLOR = '#FF8000';

// Currency symbols map
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

// Analytics time periods
export const TIME_PERIODS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

// Define subscription type
export interface Subscription {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  startDate: string;
  interval: string;
  reminder: string;
  createdAt: string;
}

// Category chart data item
export interface CategoryItem {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}
