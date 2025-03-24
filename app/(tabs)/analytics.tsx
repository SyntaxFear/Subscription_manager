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
      let monthlyCost = 0;

      // Calculate monthly cost based on interval
      if (intervalDays === 30) {
        // Monthly subscription
        monthlyCost = sub.price;
      } else if (intervalDays === 7) {
        // Weekly subscription
        monthlyCost = sub.price * 4;
      } else if (intervalDays === 365) {
        // Yearly subscription
        monthlyCost = sub.price / 12;
      } else if (intervalDays === 90) {
        // Quarterly subscription
        monthlyCost = sub.price / 3;
      } else if (intervalDays === 14) {
        // Bi-weekly subscription
        monthlyCost = sub.price * 2;
      } else if (intervalDays === 60) {
        // Bi-monthly subscription
        monthlyCost = sub.price / 2;
      } else if (intervalDays === 1) {
        // Daily subscription
        monthlyCost = sub.price * 30;
      } else {
        // Custom interval - calculate based on days
        monthlyCost = (sub.price * 30) / intervalDays;
      }

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + monthlyCost;
    });

    return costsByCurrency;
  };

  // Calculate total quarterly cost
  const getTotalQuarterlyCost = () => {
    // Track costs per currency
    const costsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const intervalDays = parseInt(sub.interval);
      let quarterlyCost = 0;

      // Calculate quarterly cost based on interval
      if (intervalDays === 30) {
        // Monthly subscription
        quarterlyCost = sub.price * 3;
      } else if (intervalDays === 7) {
        // Weekly subscription
        quarterlyCost = sub.price * 13;
      } else if (intervalDays === 365) {
        // Yearly subscription
        quarterlyCost = sub.price / 4;
      } else if (intervalDays === 90) {
        // Quarterly subscription
        quarterlyCost = sub.price;
      } else if (intervalDays === 14) {
        // Bi-weekly subscription
        quarterlyCost = sub.price * 6;
      } else if (intervalDays === 60) {
        // Bi-monthly subscription
        quarterlyCost = sub.price * 1.5;
      } else if (intervalDays === 1) {
        // Daily subscription
        quarterlyCost = sub.price * 90;
      } else {
        // Custom interval - calculate based on days
        quarterlyCost = (sub.price * 90) / intervalDays;
      }

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + quarterlyCost;
    });

    return costsByCurrency;
  };

  // Calculate total yearly cost
  const getTotalYearlyCost = () => {
    // Track costs per currency
    const costsByCurrency: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const intervalDays = parseInt(sub.interval);
      let yearlyCost = 0;

      // Calculate yearly cost based on interval
      if (intervalDays === 30) {
        // Monthly subscription
        yearlyCost = sub.price * 12;
      } else if (intervalDays === 7) {
        // Weekly subscription
        yearlyCost = sub.price * 52;
      } else if (intervalDays === 365) {
        // Yearly subscription
        yearlyCost = sub.price;
      } else if (intervalDays === 90) {
        // Quarterly subscription
        yearlyCost = sub.price * 4;
      } else if (intervalDays === 14) {
        // Bi-weekly subscription
        yearlyCost = sub.price * 26;
      } else if (intervalDays === 60) {
        // Bi-monthly subscription
        yearlyCost = sub.price * 6;
      } else if (intervalDays === 1) {
        // Daily subscription
        yearlyCost = sub.price * 365;
      } else {
        // Custom interval - calculate based on days
        yearlyCost = (sub.price * 365) / intervalDays;
      }

      costsByCurrency[sub.currency] = (costsByCurrency[sub.currency] || 0) + yearlyCost;
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

      // First add regular monthly costs
      subs.forEach((sub) => {
        const intervalDays = parseInt(sub.interval);

        // Skip quarterly subscriptions as we'll handle them separately
        if (intervalDays === 90) return;

        // Calculate monthly equivalent cost for non-quarterly subscriptions
        let monthlyCost = 0;
        if (intervalDays === 30) {
          monthlyCost = sub.price;
        } else if (intervalDays === 7) {
          monthlyCost = sub.price * 4;
        } else if (intervalDays === 365) {
          monthlyCost = sub.price / 12;
        } else if (intervalDays === 14) {
          monthlyCost = sub.price * 2;
        } else if (intervalDays === 60) {
          monthlyCost = sub.price / 2;
        } else if (intervalDays === 1) {
          monthlyCost = sub.price * 30;
        } else {
          monthlyCost = (sub.price * 30) / intervalDays;
        }

        // Add monthly cost to all months
        for (let i = 0; i < 6; i++) {
          projectionData[i] += monthlyCost;
        }
      });

      // Now handle quarterly subscriptions
      subs.forEach((sub) => {
        const intervalDays = parseInt(sub.interval);
        if (intervalDays !== 90) return;

        const startDate = new Date(sub.startDate);
        const today = new Date();
        const daysSinceStart = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        );
        const daysUntilNextPayment = 90 - (daysSinceStart % 90);

        // Calculate next payment date
        let nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + daysUntilNextPayment);

        // Add quarterly payments to projection
        for (let i = 0; i < 6; i++) {
          const monthDate = new Date();
          monthDate.setMonth(currentMonth + i);

          if (
            monthDate.getMonth() === nextPaymentDate.getMonth() &&
            monthDate.getFullYear() === nextPaymentDate.getFullYear()
          ) {
            projectionData[i] += sub.price;
          }

          // Check if there's another payment 3 months later within our 6-month window
          const threeMonthsLater = new Date(nextPaymentDate);
          threeMonthsLater.setMonth(nextPaymentDate.getMonth() + 3);
          if (
            monthDate.getMonth() === threeMonthsLater.getMonth() &&
            monthDate.getFullYear() === threeMonthsLater.getFullYear()
          ) {
            projectionData[i] += sub.price;
          }
        }
      });

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
