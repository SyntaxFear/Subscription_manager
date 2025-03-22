import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from '~/components/nativewindui/Text';
import { Card } from './Card';

// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

// Orange brand color
const ORANGE_COLOR = '#FF8000';

interface ForecastChartProps {
  currency: string;
  projectionData: any;
  colors: any;
}

export const ForecastChart = ({ currency, projectionData, colors }: ForecastChartProps) => {
  const windowWidth = Dimensions.get('window').width;

  // Validate that projectionData is properly structured
  if (
    !projectionData ||
    !projectionData.datasets ||
    !projectionData.datasets[0] ||
    !projectionData.datasets[0].data
  ) {
    return (
      <Card title="Expense Projection" currency={currency}>
        <View className="items-center justify-center py-10">
          <Text className="text-sm font-light text-gray-400">No forecast data available</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card title="Expense Projection" currency={currency}>
      <View className="pt-2.5">
        <LineChart
          data={projectionData}
          width={windowWidth - 64}
          height={180}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: colors.card || '#FFFFFF',
            backgroundGradientTo: colors.card || '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 128, 0, ${opacity})`,
            labelColor: (opacity = 1) => colors.grey2 || '#999999',
            style: { borderRadius: 16, marginHorizontal: -10 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: ORANGE_COLOR,
            },
            fillShadowGradient: ORANGE_COLOR,
            fillShadowGradientOpacity: 0.25,
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.grey4 || '#EEEEEE',
              strokeOpacity: 0.2,
            },
            propsForLabels: {
              fontSize: 10,
              fontWeight: '600',
            },
          }}
          withShadow
          withInnerLines={false}
          withOuterLines={true}
          bezier
          style={{ marginHorizontal: -10 }}
        />
      </View>

      {/* Interactive forecast details */}
      <View className="px-4 py-3.5">
        {(() => {
          const data = projectionData.datasets[0].data;
          if (!data || data.length === 0) return null;

          const maxValue = Math.max(...data);
          const maxIndex = data.indexOf(maxValue);
          const minValue = Math.min(...data);
          const minIndex = data.indexOf(minValue);
          const avgValue = data.reduce((a: number, b: number) => a + b, 0) / data.length;

          return (
            <View className="mb-5">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2.5 h-2.5 w-2.5 rounded-full bg-orange-500 opacity-70" />
                <View className="flex-1 flex-row items-center justify-between">
                  <Text className="text-xs opacity-80">Monthly Average</Text>
                  <Text className="text-sm font-semibold">
                    {CURRENCY_SYMBOLS[currency] || currency}
                    {avgValue.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="mb-3 flex-row items-center">
                <View className="mr-2.5 h-2.5 w-2.5 rounded-full bg-orange-500" />
                <View className="flex-1 flex-row items-center justify-between">
                  <Text className="text-xs opacity-80">
                    Highest ({projectionData.labels[maxIndex]})
                  </Text>
                  <Text className="text-sm font-semibold">
                    {CURRENCY_SYMBOLS[currency] || currency}
                    {maxValue.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="mr-2.5 h-2.5 w-2.5 rounded-full bg-orange-500 opacity-40" />
                <View className="flex-1 flex-row items-center justify-between">
                  <Text className="text-xs opacity-80">
                    Lowest ({projectionData.labels[minIndex]})
                  </Text>
                  <Text className="text-sm font-semibold">
                    {CURRENCY_SYMBOLS[currency] || currency}
                    {minValue.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Monthly breakdown bars */}
        <View className="h-20 flex-row items-end justify-around border-t border-gray-200/20 pt-3.5">
          {projectionData.labels.map((month: string, index: number) => {
            const data = projectionData.datasets[0].data;
            if (!data || data.length === 0) return null;

            const maxValue = Math.max(...data);
            const value = data[index];
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <View key={index} className="w-5 items-center">
                <View className="h-[50px] w-full justify-end">
                  <View
                    className={`min-h-[3px] w-2 self-center rounded-full ${
                      index === data.indexOf(maxValue) ? 'bg-orange-500' : ''
                    }`}
                    style={{
                      height: `${percentage}%`,
                      backgroundColor:
                        index !== data.indexOf(maxValue)
                          ? `rgba(255, 128, 0, ${0.3 + percentage / 300})`
                          : undefined,
                    }}
                  />
                </View>
                <Text className="mt-1.5 text-xs opacity-70">{month.substring(0, 1)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};
