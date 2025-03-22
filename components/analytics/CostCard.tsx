import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

interface CostCardProps {
  currency: string;
  cost: number;
  period: string;
  subscriptionCount: number;
}

export const CostCard = ({ currency, cost, period, subscriptionCount }: CostCardProps) => {
  return (
    <View className="relative mb-2.5 w-[48%] rounded-2xl bg-card p-4">
      <View className="absolute right-3 top-3 rounded bg-gray-500/10 px-1.5 py-0.5">
        <Text className="text-xs font-medium opacity-80">{currency}</Text>
      </View>

      <Text className="mb-0.5 text-2xl font-bold text-orange-500">
        {CURRENCY_SYMBOLS[currency] || currency}
        {cost.toFixed(2)}
      </Text>

      <Text className="text-sm opacity-70">{period.charAt(0).toUpperCase() + period.slice(1)}</Text>

      <Text className="mt-2 text-xs opacity-60">
        {subscriptionCount} subscription{subscriptionCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};
