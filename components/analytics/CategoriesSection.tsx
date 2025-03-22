import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { CategoryChart } from './CategoryChart';
import { CategoryItem } from './constants';

interface CategoriesSectionProps {
  categoryDataByCurrency: Record<string, CategoryItem[]>;
  colors: any;
}

export const CategoriesSection = ({ categoryDataByCurrency, colors }: CategoriesSectionProps) => {
  return (
    <View className="mb-5">
      <SectionHeader title="Categories" icon="PieChart" />

      {Object.entries(categoryDataByCurrency).map(([currency, data]) => (
        <CategoryChart key={currency} currency={currency} data={data} colors={colors} />
      ))}
    </View>
  );
};
