import React from 'react';
import { View } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Text } from '~/components/nativewindui/Text';
import { SubscriptionCard } from './SubscriptionCard';
import { Subscription } from './types';

interface SelectedDateInfoProps {
  formattedDate: string;
  dueSubscriptions: Subscription[];
  getCategoryColor: (category: string) => string;
  colors: any; // Replace with appropriate type from your color scheme
}

export const SelectedDateInfo = ({
  formattedDate,
  dueSubscriptions,
  getCategoryColor,
  colors,
}: SelectedDateInfoProps) => {
  return (
    <View className="p-4">
      <Text variant="title3" className="mb-2 font-semibold">
        {formattedDate}
      </Text>

      {dueSubscriptions.length > 0 ? (
        <>
          <Text variant="subhead" color="tertiary" className="mb-4">
            You have {dueSubscriptions.length} payment
            {dueSubscriptions.length > 1 ? 's' : ''} due on this date.
          </Text>

          {dueSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              getCategoryColor={getCategoryColor}
              colors={colors}
            />
          ))}
        </>
      ) : (
        <View className="items-center py-8">
          <LucideIcons.CheckCircle size={32} color={colors.grey3} />
          <Text color="tertiary" className="mt-2 text-center">
            No payments due on this date
          </Text>
          <Text color="tertiary" className="mt-1 text-center text-xs">
            Orange dots indicate subscription payment dates
          </Text>
        </View>
      )}
    </View>
  );
};
