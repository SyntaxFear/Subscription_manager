import React from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Text } from '~/components/nativewindui/Text';
import { Card } from './Card';

// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  entertainment: '#FF4757', // Red
  productivity: '#2ED573', // Green
  tech: '#1E90FF', // Blue
  utilities: '#FFA502', // Orange
  shopping: '#7B68EE', // Purple
  health: '#26de81', // Green
  food: '#FF6B6B', // Pink
  music: '#A3CB38', // Lime
  education: '#5352ED', // Indigo
  finance: '#2bcbba', // Teal
  travel: '#FF9FF3', // Light Pink
  social: '#1289A7', // Blue Green
  news: '#D980FA', // Purple
  other: '#B53471', // Dark Pink
};

interface CategoryItem {
  name: string;
  value: number;
  color?: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

interface CategoryChartProps {
  currency: string;
  data: CategoryItem[];
  colors: any;
}

export const CategoryChart = ({ currency, data, colors }: CategoryChartProps) => {
  const windowWidth = Dimensions.get('window').width;

  if (data.length === 0) {
    return (
      <Card title="Spending by Category" currency={currency}>
        <View className="flex items-center justify-center py-10">
          <Text className="text-sm font-light text-gray-400">No data available</Text>
        </View>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Sort data by value for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Get category color based on name (lowercase)
  const getCategoryColor = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    return CATEGORY_COLORS[normalizedCategory] || '#B53471'; // Default to "other" color if not found
  };

  // Transform data for react-native-gifted-charts format
  const pieData = sortedData.map((item) => ({
    value: item.value,
    color: getCategoryColor(item.name),
    focused: false,
    name: item.name,
    textColor: 'transparent', // Hide the text labels inside the chart
    textBackgroundColor: 'transparent',
    textSize: 0,
  }));

  return (
    <Card title="Spending by Category" currency={currency}>
      <View className="px-4">
        {/* Main chart and legend container */}
        <View className="mb-4">
          <View className="flex-row">
            {/* Left side: Chart */}
            <View className="w-1/2 items-center justify-center pl-0">
              <PieChart
                data={pieData}
                donut
                showGradient={true}
                showText={false}
                radius={80}
                innerRadius={50}
                innerCircleColor={colors.background}
                labelsPosition={'outward'}
                showValuesAsLabels={false}
                showTextBackground={false}
                textBackgroundRadius={0}
                centerLabelComponent={() => (
                  <View className="items-center justify-center border-t border-gray-200/10">
                    <Text className="mx-auto text-xs font-light uppercase opacity-50">TOTAL</Text>
                    <Text className="mx-auto text-xl font-bold text-orange-500">
                      {CURRENCY_SYMBOLS[currency] || currency}
                      {total.toFixed(0)}
                    </Text>
                  </View>
                )}
                focusOnPress={true}
                strokeWidth={1}
                strokeColor={colors.background}
              />
            </View>

            {/* Right side: Modern legend with percentage */}
            <View className="w-1/2 justify-center pl-1">
              {sortedData.slice(0, Math.min(3, sortedData.length)).map((category, index) => (
                <View key={index} className="mb-3">
                  <View className="flex-row items-center">
                    <View
                      className="mr-2 h-3 w-3 rounded-sm"
                      style={{ backgroundColor: getCategoryColor(category.name) }}
                    />
                    <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
                      {category.name}
                    </Text>
                    <Text className="text-sm font-bold">
                      {Math.round((category.value / total) * 100)}%
                    </Text>
                  </View>
                  <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100/10">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((category.value / total) * 100)}%`,
                        backgroundColor: getCategoryColor(category.name),
                      }}
                    />
                  </View>
                </View>
              ))}

              {/* Show more categories button if needed */}
              {sortedData.length > 3 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mt-1 self-start rounded-full bg-gray-100/5 px-2 py-1">
                  <Text className="text-xs opacity-60">+{sortedData.length - 3} more</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};
