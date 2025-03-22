import React from 'react';
import { View } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Text } from '~/components/nativewindui/Text';

// Orange brand color
const ORANGE_COLOR = '#FF8000';

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof LucideIcons;
}

export const SectionHeader = ({ title, icon }: SectionHeaderProps) => {
  // Fix: Cast the dynamic icon component to any to avoid TypeScript errors
  const IconComponent = LucideIcons[icon] as any;

  return (
    <View className="mb-3 flex-row items-center">
      <IconComponent size={18} color={ORANGE_COLOR} />
      <Text variant="heading" className="mx-2 text-base font-semibold">
        {title}
      </Text>
      <View className="h-px flex-1 bg-gray-200/70" />
    </View>
  );
};
