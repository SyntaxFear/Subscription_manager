import React from 'react';
import { View } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Text } from '~/components/nativewindui/Text';

// Orange brand color
const ORANGE_COLOR = '#FF8000';

interface InsightCardProps {
  title: string;
  value: string;
  detail: string;
  icon: keyof typeof LucideIcons;
}

export const InsightCard = ({ title, value, detail, icon }: InsightCardProps) => {
  const IconComponent = LucideIcons[icon] as any;

  return (
    <View className="w-1/2 p-2">
      <View className="mb-1.5 flex-row items-center">
        <IconComponent size={18} color={ORANGE_COLOR} />
        <Text className="ml-1.5 text-xs font-medium">{title}</Text>
      </View>
      <Text className="text-sm font-semibold">{value}</Text>
      <Text className="mt-0.5 text-xs opacity-70">{detail}</Text>
    </View>
  );
};
