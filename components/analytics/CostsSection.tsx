import React from 'react';
import { View } from 'react-native';
import { CostCard } from './CostCard';

interface CostsSectionProps {
  totalCosts: Record<string, number>;
  subscriptions: any[];
  activePeriod: string;
}

export const CostsSection = ({ totalCosts, subscriptions, activePeriod }: CostsSectionProps) => {
  return (
    <View className="mb-4 flex-row flex-wrap justify-between">
      {Object.entries(totalCosts).map(([currency, cost]) => (
        <CostCard
          key={currency}
          currency={currency}
          cost={cost}
          period={activePeriod}
          subscriptionCount={subscriptions.filter((sub) => sub.currency === currency).length}
        />
      ))}
    </View>
  );
};
