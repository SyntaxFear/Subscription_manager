import { Stack } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LucideIcons from 'lucide-react-native';
import { DateData } from 'react-native-calendars';

import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

// Import new components
import { CalendarHeader } from '~/components/calendar/CalendarHeader';
import { CalendarView } from '~/components/calendar/CalendarView';
import { SelectedDateInfo } from '~/components/calendar/SelectedDateInfo';
import { UpcomingPaymentsList } from '~/components/calendar/UpcomingPaymentsList';
import {
  Subscription,
  UpcomingPayment,
  ViewMode,
  CURRENCY_SYMBOLS,
  ORANGE_COLOR,
} from '~/components/calendar/types';

export default function CalendarScreen() {
  const { colors } = useColorScheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [dueSubscriptions, setDueSubscriptions] = useState<Subscription[]>([]);

  // Load subscriptions from AsyncStorage
  const loadSubscriptions = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('@Subs:subscriptions');
      const parsedData = data ? JSON.parse(data) : [];
      setSubscriptions(parsedData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Generate marked dates when subscriptions change or selected date changes
  useEffect(() => {
    if (subscriptions.length === 0) return;

    const marked: Record<string, any> = {};
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Mark today
    const todayStr = today.toISOString().split('T')[0];
    marked[todayStr] = {
      marked: true,
      dotColor: ORANGE_COLOR,
      selected: todayStr === selectedDate,
      selectedColor: ORANGE_COLOR,
    };

    // Mark selected date if not today
    if (selectedDate && selectedDate !== todayStr) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: ORANGE_COLOR,
      };
    }

    // Calculate due dates for all subscriptions for this month and next month
    subscriptions.forEach((sub) => {
      const startDate = new Date(sub.startDate);
      const intervalDays = parseInt(sub.interval);
      const today = new Date();

      // Calculate days since start
      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      const daysElapsed = daysSinceStart % intervalDays;
      const daysUntilNext = intervalDays - daysElapsed;

      // Calculate next billing date and mark future dates
      for (let i = 0; i < 12; i++) {
        const paymentDate = new Date(today);
        paymentDate.setDate(today.getDate() + daysUntilNext + i * intervalDays);

        const dateStr = paymentDate.toISOString().split('T')[0];

        // Mark this date
        marked[dateStr] = {
          ...(marked[dateStr] || {}),
          marked: true,
          dotColor: ORANGE_COLOR,
          selected: dateStr === selectedDate,
          selectedColor: ORANGE_COLOR,
        };
      }
    });

    setMarkedDates(marked);

    // Update due subscriptions for selected date
    updateDueSubscriptions(selectedDate);
  }, [subscriptions, selectedDate]);

  // Update due subscriptions for a specific date
  const updateDueSubscriptions = (date: string) => {
    const selectedDate = new Date(date);

    const due = subscriptions.filter((sub) => {
      // Use the same payment calculation as in the SubscriptionCard component
      const startDate = new Date(sub.startDate);
      const intervalDays = parseInt(sub.interval);
      const today = new Date();

      // Calculate days since start and next payment date
      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      const daysElapsed = daysSinceStart % intervalDays;
      const daysUntilNext = intervalDays - daysElapsed;

      // Calculate the next few payment dates (up to 12 payments in the future)
      for (let i = 0; i < 12; i++) {
        const paymentDate = new Date(today);
        paymentDate.setDate(today.getDate() + daysUntilNext + i * intervalDays);

        // Check if the selected date matches this payment date
        if (paymentDate.toISOString().split('T')[0] === date) {
          return true;
        }
      }

      return false;
    });

    setDueSubscriptions(due);
  };

  // Handle date selection
  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
    updateDueSubscriptions(date.dateString);
  };

  // Format date for display
  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get upcoming due dates in the next 3 months
  const getUpcomingDueDates = (): UpcomingPayment[] => {
    if (subscriptions.length === 0) return [];

    const upcoming: UpcomingPayment[] = [];
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setDate(today.getDate() + 90); // Look ahead 90 days (3 months)

    // Create a map of payment dates to subscriptions
    const paymentDateMap: Record<string, Subscription[]> = {};

    // Calculate payment dates for each subscription
    subscriptions.forEach((sub) => {
      const startDate = new Date(sub.startDate);
      const intervalDays = parseInt(sub.interval);

      // Calculate days since start and next payment date
      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      const daysElapsed = daysSinceStart % intervalDays;
      const daysUntilNext = intervalDays - daysElapsed;

      // Calculate all payment dates within the next 3 months
      let paymentDate = new Date(today);
      paymentDate.setDate(today.getDate() + daysUntilNext);

      // Keep adding payment dates until we're past our 3-month window
      while (paymentDate <= threeMonthsLater) {
        const dateStr = paymentDate.toISOString().split('T')[0];
        if (!paymentDateMap[dateStr]) {
          paymentDateMap[dateStr] = [];
        }
        paymentDateMap[dateStr].push(sub);

        // Move to next payment date
        const nextDate = new Date(paymentDate);
        nextDate.setDate(paymentDate.getDate() + intervalDays);
        paymentDate = nextDate;
      }
    });

    // Convert the map to the expected array format
    Object.entries(paymentDateMap).forEach(([date, subs]) => {
      upcoming.push({
        date,
        subscriptions: subs,
      });
    });

    // Sort by date
    upcoming.sort((a, b) => a.date.localeCompare(b.date));

    return upcoming;
  };

  // Get subscription category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
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
    return colors[category] || ORANGE_COLOR;
  };

  // Calculate total due amount for a specific date
  const calculateTotalDueAmount = (subs: Subscription[]) => {
    return subs.reduce((total, sub) => total + sub.price, 0);
  };

  // Get currency symbol for multiple subscriptions (most common)
  const getCurrencySymbol = (subs: Subscription[]) => {
    if (subs.length === 0) return '$';

    const currencyCounts: Record<string, number> = {};
    subs.forEach((sub) => {
      currencyCounts[sub.currency] = (currencyCounts[sub.currency] || 0) + 1;
    });

    let mostCommonCurrency = 'USD';
    let highestCount = 0;

    Object.entries(currencyCounts).forEach(([currency, count]) => {
      if (count > highestCount) {
        mostCommonCurrency = currency;
        highestCount = count;
      }
    });

    return CURRENCY_SYMBOLS[mostCommonCurrency] || '$';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Payment Calendar' }} />
        <View className="flex-1 items-center justify-center">
          <LucideIcons.Calendar size={32} color={ORANGE_COLOR} />
          <Text className="pt-4">Loading calendar...</Text>
        </View>
      </View>
    );
  }

  const upcomingDueDates = getUpcomingDueDates();

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Calendar' }} />
      <View className="flex-1 bg-background">
        {/* View Mode Toggle */}
        <CalendarHeader viewMode={viewMode} onViewModeChange={setViewMode} colors={colors} />

        {viewMode === 'calendar' ? (
          // Calendar View
          <ScrollView
            contentContainerStyle={{ paddingBottom: 140 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={ORANGE_COLOR}
                colors={[ORANGE_COLOR]}
              />
            }>
            {/* Calendar */}
            <CalendarView markedDates={markedDates} onDayPress={handleDateSelect} colors={colors} />

            {/* Selected Date Info */}
            <SelectedDateInfo
              formattedDate={formatSelectedDate(selectedDate)}
              dueSubscriptions={dueSubscriptions}
              getCategoryColor={getCategoryColor}
              colors={colors}
            />
          </ScrollView>
        ) : (
          // List View
          <UpcomingPaymentsList
            upcomingDueDates={upcomingDueDates}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setViewMode('calendar');
            }}
            getCategoryColor={getCategoryColor}
            getCurrencySymbol={getCurrencySymbol}
            calculateTotalDueAmount={calculateTotalDueAmount}
            colors={colors}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </>
  );
}
