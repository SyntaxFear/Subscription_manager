import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

import { Text } from '~/components/nativewindui/Text';
import { ViewMode, ORANGE_COLOR } from './types';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  colors: any; // Replace with appropriate type from your color scheme
}

export const CalendarHeader = ({ viewMode, onViewModeChange, colors }: CalendarHeaderProps) => {
  return (
    <View className="flex-row bg-transparent p-3">
      <TouchableOpacity
        activeOpacity={0.7}
        className={`mx-1 flex-1 flex-row items-center justify-center rounded-lg py-2 ${
          viewMode === 'calendar' ? 'bg-orange-500' : 'bg-black/5'
        }`}
        onPress={() => onViewModeChange('calendar')}>
        <LucideIcons.Calendar
          size={18}
          color={viewMode === 'calendar' ? '#FFFFFF' : colors.grey2}
        />
        <Text className={`ml-1.5 font-medium ${viewMode === 'calendar' ? 'text-white' : ''}`}>
          Calendar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        className={`mx-1 flex-1 flex-row items-center justify-center rounded-lg py-2 ${
          viewMode === 'list' ? 'bg-orange-500' : 'bg-black/5'
        }`}
        onPress={() => onViewModeChange('list')}>
        <LucideIcons.List size={18} color={viewMode === 'list' ? '#FFFFFF' : colors.grey2} />
        <Text className={`ml-1.5 font-medium ${viewMode === 'list' ? 'text-white' : ''}`}>
          List
        </Text>
      </TouchableOpacity>
    </View>
  );
};
