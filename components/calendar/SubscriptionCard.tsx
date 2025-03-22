import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Subscription, CURRENCY_SYMBOLS, ORANGE_COLOR } from './types';

interface SubscriptionCardProps {
  subscription: Subscription;
  getCategoryColor: (category: string) => string;
  colors: any; // Replace with appropriate type from your color scheme
}

export const SubscriptionCard = ({
  subscription,
  getCategoryColor,
  colors,
}: SubscriptionCardProps) => {
  return (
    <View className="relative mb-3 overflow-hidden rounded-xl bg-card shadow-sm">
      <View
        className="absolute left-0 top-0 h-full w-0.5"
        style={{ backgroundColor: getCategoryColor(subscription.category) }}
      />
      <View className="px-4 py-3 pl-5">
        <View className="flex-row items-center justify-between">
          <Text variant="subhead" className="font-semibold">
            {subscription.name}
          </Text>
          <Text variant="subhead" className="text-orange-500">
            {CURRENCY_SYMBOLS[subscription.currency] || '$'}
            {subscription.price.toFixed(2)}
          </Text>
        </View>

        {subscription.description ? (
          <Text color="tertiary" numberOfLines={1} className="mt-1">
            {subscription.description}
          </Text>
        ) : null}

        <Text color="tertiary" className="mt-2 text-xs">
          Every {subscription.interval} days
        </Text>
      </View>
    </View>
  );
};
