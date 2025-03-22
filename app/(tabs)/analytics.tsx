import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LucideIcons from 'lucide-react-native';

import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { PeriodSelector } from '~/components/analytics/PeriodSelector';
import { CostsSection } from '~/components/analytics/CostsSection';
import { CategoriesSection } from '~/components/analytics/CategoriesSection';
import { ForecastSection } from '~/components/analytics/ForecastSection';
import { InsightsSection } from '~/components/analytics/InsightsSection';
import { ORANGE_COLOR, Subscription } from '~/components/analytics/constants';

export default function AnalyticsScreen() {
  const { colors } = useColorScheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  // Load subscriptions from AsyncStorage
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await AsyncStorage.getItem('@Subs:subscriptions');
        const parsedData = data ? JSON.parse(data) : [];
        setSubscriptions(parsedData);
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  // Calculate total monthly cost
  const getTotalMonthlyCost = () => {
    // Track costs per currency
    const costsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const intervalDays = parseInt(sub.interval);
      const monthlyFactor = 30 / intervalDays;
      const cost = sub.price * monthlyFactor;

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + cost;
    });

    return costsByCurrency;
  };

  // Calculate total quarterly cost
  const getTotalQuarterlyCost = () => {
    // Track costs per currency
    const costsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const intervalDays = parseInt(sub.interval);
      const quarterlyFactor = 90 / intervalDays;
      const cost = sub.price * quarterlyFactor;

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + cost;
    });

    return costsByCurrency;
  };

  // Calculate total yearly cost
  const getTotalYearlyCost = () => {
    // Track costs per currency
    const costsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const intervalDays = parseInt(sub.interval);
      const yearlyFactor = 365 / intervalDays;
      const cost = sub.price * yearlyFactor;

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + cost;
    });

    return costsByCurrency;
  };

  // Get total cost based on active period
  const getTotalCost = () => {
    switch (activePeriod) {
      case 'monthly':
        return getTotalMonthlyCost();
      case 'quarterly':
        return getTotalQuarterlyCost();
      case 'yearly':
        return getTotalYearlyCost();
      default:
        return getTotalMonthlyCost();
    }
  };

  // Check if we have multiple currencies
  const hasMultipleCurrencies = () => {
    const currencies = subscriptions.map((sub) => sub.currency);
    return new Set(currencies).size > 1;
  };

  // Calculate category data for pie chart - separated by currency
  const getCategoryDataByCurrency = () => {
    const categoryDataByCurrency: Record<string, any[]> = {};

    // Group subscriptions by currency
    const subscriptionsByCurrency: Record<string, Subscription[]> = {};

    subscriptions.forEach((sub) => {
      if (!subscriptionsByCurrency[sub.currency]) {
        subscriptionsByCurrency[sub.currency] = [];
        categoryDataByCurrency[sub.currency] = [];
      }
      subscriptionsByCurrency[sub.currency].push(sub);
    });

    // Generate colors for categories
    const chartColors = [
      '#FF4757', // Red
      '#2ED573', // Green
      '#1E90FF', // Blue
      '#FFA502', // Orange
      '#7B68EE', // Purple
      '#26de81', // Green
      '#FF6B6B', // Pink
      '#A3CB38', // Lime
      '#5352ED', // Indigo
      '#2bcbba', // Teal
      '#FF9FF3', // Light Pink
      '#1289A7', // Blue Green
      '#D980FA', // Purple
      '#B53471', // Dark Pink
    ];

    // Calculate category data for each currency
    Object.entries(subscriptionsByCurrency).forEach(([currency, subs]) => {
      const categoryMap: Record<string, number> = {};

      subs.forEach((sub) => {
        const intervalDays = parseInt(sub.interval);
        let cost = sub.price;

        // Normalize to the selected period
        if (activePeriod === 'monthly') {
          cost = cost * (30 / intervalDays);
        } else if (activePeriod === 'quarterly') {
          cost = cost * (90 / intervalDays);
        } else if (activePeriod === 'yearly') {
          cost = cost * (365 / intervalDays);
        }

        categoryMap[sub.category] = (categoryMap[sub.category] || 0) + cost;
      });

      // Convert to chart format
      categoryDataByCurrency[currency] = Object.entries(categoryMap).map(
        ([name, value], index) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: chartColors[index % chartColors.length],
          legendFontColor: colors.grey2 || '#888888',
          legendFontSize: 12,
        })
      );
    });

    return categoryDataByCurrency;
  };

  // Get projection data by currency
  const getProjectionDataByCurrency = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentMonth = new Date().getMonth();
    const projectionByCurrency: Record<string, any> = {};

    // Group subscriptions by currency
    const subscriptionsByCurrency: Record<string, Subscription[]> = {};

    subscriptions.forEach((sub) => {
      if (!subscriptionsByCurrency[sub.currency]) {
        subscriptionsByCurrency[sub.currency] = [];
      }
      subscriptionsByCurrency[sub.currency].push(sub);
    });

    // Calculate projections for each currency
    Object.entries(subscriptionsByCurrency).forEach(([currency, subs]) => {
      // Initialize projection data structure for this currency
      const projectionData = Array(6).fill(0);

      // Initialize with monthly cost
      const monthlyCosts = getTotalMonthlyCost();
      if (monthlyCosts[currency]) {
        for (let i = 0; i < 6; i++) {
          projectionData[i] = monthlyCosts[currency];
        }
      }

      // Add upcoming subscription renewals
      subs.forEach((sub) => {
        const startDate = new Date(sub.startDate);
        const intervalDays = parseInt(sub.interval);

        // Skip daily/weekly subscriptions for projection
        if (intervalDays < 28) return;

        // Calculate the next few renewal dates
        for (let i = 0; i < 6; i++) {
          const targetMonth = (currentMonth + i) % 12;
          const targetYear = new Date().getFullYear() + Math.floor((currentMonth + i) / 12);

          // Check if subscription renews in this month
          const daysSinceStart = Math.floor(
            (new Date(targetYear, targetMonth, 15).getTime() - startDate.getTime()) /
              (1000 * 3600 * 24)
          );

          if (daysSinceStart % intervalDays < 30 && intervalDays >= 28) {
            // This is an approximate but good enough calculation for visualization
            projectionData[i] += sub.price;
          }
        }
      });

      // Ensure non-empty projections (fixes issue with some currencies)
      // If all values are 0, put in the monthly cost for that currency
      if (projectionData.every((value) => value === 0) && monthlyCosts[currency]) {
        for (let i = 0; i < 6; i++) {
          projectionData[i] = monthlyCosts[currency];
        }
      }

      // Ensure we have at least some small value to display
      // If all values are still 0, put in a small value to ensure chart appears
      if (projectionData.every((value) => value === 0)) {
        for (let i = 0; i < 6; i++) {
          projectionData[i] = 1; // Minimum value to display chart
        }
      }

      projectionByCurrency[currency] = {
        labels: months
          .slice(currentMonth, currentMonth + 6)
          .concat(months.slice(0, (currentMonth + 6) % 12))
          .slice(0, 6),
        datasets: [
          {
            data: projectionData,
            color: () => ORANGE_COLOR,
            strokeWidth: 2,
          },
        ],
      };
    });

    return projectionByCurrency;
  };

  // Get most expensive subscription by currency
  const getMostExpensiveSubscriptionByCurrency = () => {
    if (subscriptions.length === 0) return {};

    // Group subscriptions by currency
    const subscriptionsByCurrency: Record<string, Subscription[]> = {};
    subscriptions.forEach((sub) => {
      if (!subscriptionsByCurrency[sub.currency]) {
        subscriptionsByCurrency[sub.currency] = [];
      }
      subscriptionsByCurrency[sub.currency].push(sub);
    });

    // Find most expensive within each currency
    const mostExpensiveByCurrency: Record<string, Subscription> = {};

    Object.entries(subscriptionsByCurrency).forEach(([currency, subs]) => {
      mostExpensiveByCurrency[currency] = subs.reduce((most, current) => {
        const currentNormalized = current.price * (30 / parseInt(current.interval));
        const mostNormalized = most.price * (30 / parseInt(most.interval));

        return currentNormalized > mostNormalized ? current : most;
      }, subs[0]);
    });

    return mostExpensiveByCurrency;
  };

  // Add refreshing handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await AsyncStorage.getItem('@Subs:subscriptions');
      const parsedData = data ? JSON.parse(data) : [];
      setSubscriptions(parsedData);
    } catch (error) {
      console.error('Error refreshing subscriptions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get most frequent subscription by currency
  const getMostFrequentSubscriptionByCurrency = () => {
    if (subscriptions.length === 0) return {};

    // Group subscriptions by currency
    const subscriptionsByCurrency: Record<string, Subscription[]> = {};
    subscriptions.forEach((sub) => {
      if (!subscriptionsByCurrency[sub.currency]) {
        subscriptionsByCurrency[sub.currency] = [];
      }
      subscriptionsByCurrency[sub.currency].push(sub);
    });

    // Find most frequent within each currency
    const mostFrequentByCurrency: Record<string, Subscription> = {};

    Object.entries(subscriptionsByCurrency).forEach(([currency, subs]) => {
      mostFrequentByCurrency[currency] = subs.reduce((most, current) => {
        return parseInt(current.interval) < parseInt(most.interval) ? current : most;
      }, subs[0]);
    });

    return mostFrequentByCurrency;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Analytics' }} />
        <View className="flex-1 items-center justify-center">
          <LucideIcons.BarChart3 size={32} color={ORANGE_COLOR} />
          <Text className="pt-4">Loading analytics...</Text>
        </View>
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Analytics' }} />
        <View className="flex-1 items-center justify-center p-5">
          <LucideIcons.BarChart3 size={42} color={ORANGE_COLOR} />
          <Text variant="title3" className="pb-2 pt-4 font-semibold">
            No Data Yet
          </Text>
          <Text color="tertiary" className="px-12 pb-4 text-center">
            Add your first subscription to see detailed analytics and insights.
          </Text>
        </View>
      </View>
    );
  }

  const mostExpensiveByCurrency = getMostExpensiveSubscriptionByCurrency();
  const totalCosts = getTotalCost();
  const categoryDataByCurrency = getCategoryDataByCurrency();
  const projectionDataByCurrency = getProjectionDataByCurrency();
  const hasMultipleCurrenciesValue = hasMultipleCurrencies();
  const mostFrequentByCurrency = getMostFrequentSubscriptionByCurrency();
  const totalMonthlyCosts = getTotalMonthlyCost();

  return (
    <>
      <Stack.Screen options={{ title: 'Analytics' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ORANGE_COLOR}
            colors={[ORANGE_COLOR]}
          />
        }>
        {/* Period Selector */}
        <PeriodSelector activePeriod={activePeriod} onPeriodChange={setActivePeriod} />

        {/* Currency Dashboard Cards */}
        <CostsSection
          totalCosts={totalCosts}
          subscriptions={subscriptions}
          activePeriod={activePeriod}
        />

        {/* Analytics Sections */}
        <View className="mt-2">
          {/* Category Analysis */}
          <CategoriesSection categoryDataByCurrency={categoryDataByCurrency} colors={colors} />

          {/* Projections Section */}
          <ForecastSection projectionDataByCurrency={projectionDataByCurrency} colors={colors} />

          {/* Insights */}
          <InsightsSection
            mostExpensiveByCurrency={mostExpensiveByCurrency}
            mostFrequentByCurrency={mostFrequentByCurrency}
            totalMonthlyCosts={totalMonthlyCosts}
          />
        </View>

        {/* Bottom padding */}
        <View className="h-[60px]" />
      </ScrollView>
    </>
  );
}
