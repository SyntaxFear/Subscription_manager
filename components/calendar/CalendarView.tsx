import React from 'react';
import { View } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { ORANGE_COLOR } from './types';

interface CalendarViewProps {
  markedDates: Record<string, any>;
  onDayPress: (date: DateData) => void;
  colors: any; // Replace with appropriate type from your color scheme
}

export const CalendarView = ({ markedDates, onDayPress, colors }: CalendarViewProps) => {
  return (
    <View className="p-1">
      <RNCalendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.grey2,
          selectedDayBackgroundColor: ORANGE_COLOR,
          selectedDayTextColor: '#ffffff',
          todayTextColor: ORANGE_COLOR,
          dayTextColor: colors.grey2 || '#333333',
          textDisabledColor: colors.grey4,
          dotColor: ORANGE_COLOR,
          selectedDotColor: '#ffffff',
          arrowColor: ORANGE_COLOR,
          monthTextColor: colors.grey2 || '#333333',
          textMonthFontWeight: 'bold',
        }}
      />
    </View>
  );
};
