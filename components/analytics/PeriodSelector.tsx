import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

// Orange brand color
const ORANGE_COLOR = '#FF8000';

// Analytics time periods
const TIME_PERIODS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

interface PeriodSelectorProps {
  activePeriod: string;
  onPeriodChange: (period: string) => void;
}

export const PeriodSelector = ({ activePeriod, onPeriodChange }: PeriodSelectorProps) => {
  return (
    <View className="mb-4 flex-row items-center justify-center">
      <View className="flex-row justify-center rounded-full bg-gray-500/5 p-1">
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={period.value}
            className={`rounded-3xl px-4 py-1.5 ${
              activePeriod === period.value ? 'bg-orange-500' : ''
            }`}
            onPress={() => onPeriodChange(period.value)}>
            <Text
              className={`text-xs font-medium ${
                activePeriod === period.value ? 'text-white' : ''
              }`}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
