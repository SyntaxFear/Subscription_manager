import React from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Text } from '~/components/nativewindui/Text';
import { Subscription, UpcomingPayment, CURRENCY_SYMBOLS, ORANGE_COLOR } from './types';

interface UpcomingPaymentsListProps {
  upcomingDueDates: UpcomingPayment[];
  onSelectDate: (date: string) => void;
  getCategoryColor: (category: string) => string;
  getCurrencySymbol: (subs: Subscription[]) => string;
  calculateTotalDueAmount: (subs: Subscription[]) => number;
  colors: any; // Replace with appropriate type from your color scheme
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const UpcomingPaymentsList = ({
  upcomingDueDates,
  onSelectDate,
  getCategoryColor,
  getCurrencySymbol,
  calculateTotalDueAmount,
  colors,
  refreshing = false,
  onRefresh,
}: UpcomingPaymentsListProps) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={upcomingDueDates.length === 0 ? { flex: 1 } : { paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={ORANGE_COLOR}
          colors={[ORANGE_COLOR]}
        />
      }>
      <View className="py-3">
        {upcomingDueDates.length > 0 ? (
          <>
            <Text variant="title3" className="mb-4 px-4 font-semibold">
              Upcoming Payments
            </Text>

            {upcomingDueDates.map(({ date, subscriptions }) => {
              const totalAmount = calculateTotalDueAmount(subscriptions);
              const currencySymbol = getCurrencySymbol(subscriptions);
              const isToday = date === today;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={date}
                  className={`mx-4 mb-4 rounded-xl bg-card p-4 shadow-sm ${
                    isToday ? 'border-2 border-orange-500' : ''
                  }`}
                  onPress={() => onSelectDate(date)}>
                  <View className="mb-3 flex-row justify-between">
                    <View>
                      <Text variant="title3" className="font-semibold">
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {isToday && <Text className="ml-2 text-xs">(Today)</Text>}
                      </Text>
                      <Text color="tertiary" className="mt-1">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text variant="title3" className="text-orange-500">
                        {currencySymbol}
                        {totalAmount.toFixed(2)}
                      </Text>
                      <Text color="tertiary" className="mt-1 text-right">
                        {subscriptions.length} payment{subscriptions.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-2 border-t border-black/5 pt-2">
                    {subscriptions.map((sub) => (
                      <View key={sub.id} className="flex-row items-center py-1.5">
                        <View
                          className="mr-2 h-2 w-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(sub.category) }}
                        />
                        <Text numberOfLines={1} className="flex-1">
                          {sub.name}
                        </Text>
                        <Text className="text-orange-500">
                          {CURRENCY_SYMBOLS[sub.currency] || '$'}
                          {sub.price.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <View className="items-center justify-center px-8 pt-12" style={{ minHeight: 300 }}>
            <LucideIcons.Calendar size={48} color={colors.grey3} />
            <Text variant="title3" className="mb-2 mt-4 font-semibold">
              No Upcoming Payments
            </Text>
            <Text color="tertiary" className="px-3 text-center">
              You don't have any payments scheduled for the next 3 months.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
