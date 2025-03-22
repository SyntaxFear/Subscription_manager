import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { ForecastChart } from './ForecastChart';

interface ForecastSectionProps {
  projectionDataByCurrency: Record<string, any>;
  colors: any;
}

export const ForecastSection = ({ projectionDataByCurrency, colors }: ForecastSectionProps) => {
  return (
    <View className="mb-5">
      <SectionHeader title="6-Month Forecast" icon="TrendingUp" />

      {Object.entries(projectionDataByCurrency).map(([currency, projectionData]) => (
        <ForecastChart
          key={currency}
          currency={currency}
          projectionData={projectionData}
          colors={colors}
        />
      ))}
    </View>
  );
};
