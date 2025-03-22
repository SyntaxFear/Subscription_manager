import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { SectionHeader } from './SectionHeader';
import { InsightCard } from './InsightCard';
import { CURRENCY_SYMBOLS, Subscription } from './constants';

interface InsightsSectionProps {
  mostExpensiveByCurrency: Record<string, Subscription>;
  mostFrequentByCurrency: Record<string, Subscription>;
  totalMonthlyCosts: Record<string, number>;
}

export const InsightsSection = ({
  mostExpensiveByCurrency,
  mostFrequentByCurrency,
  totalMonthlyCosts,
}: InsightsSectionProps) => {
  return (
    <View>
      <SectionHeader title="Key Insights" icon="Lightbulb" />

      <Card>
        <View className="flex-row flex-wrap p-3">
          {/* Most expensive by currency */}
          {Object.entries(mostExpensiveByCurrency).map(([currency, sub]) => (
            <InsightCard
              key={`expensive-${currency}`}
              title={`Most Expensive (${currency})`}
              value={sub.name}
              detail={`${CURRENCY_SYMBOLS[sub.currency] || currency}${sub.price} / ${
                sub.interval === '30' ? 'mo' : `${sub.interval}d`
              }`}
              icon="TrendingUp"
            />
          ))}

          {/* Monthly averages by currency */}
          {Object.entries(totalMonthlyCosts).map(([currency, cost]) => (
            <InsightCard
              key={`avg-${currency}`}
              title={`${currency} Daily Avg`}
              value={`${CURRENCY_SYMBOLS[currency] || currency}${(cost / 30).toFixed(2)}`}
              detail="per day"
              icon="CalendarClock"
            />
          ))}

          {/* Most frequent by currency */}
          {Object.entries(mostFrequentByCurrency).map(([currency, sub]) => (
            <InsightCard
              key={`frequent-${currency}`}
              title={`Most Frequent (${currency})`}
              value={sub.name}
              detail={`Every ${sub.interval} ${parseInt(sub.interval) === 1 ? 'day' : 'days'}`}
              icon="RefreshCw"
            />
          ))}
        </View>
      </Card>
    </View>
  );
};
