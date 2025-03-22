import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

interface CardProps {
  title?: string;
  currency?: string;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, currency, children, className = '' }: CardProps) => {
  return (
    <View className={`mb-2.5 overflow-hidden rounded-2xl bg-card ${className}`}>
      {(title || currency) && (
        <View className="flex-row items-center justify-between px-4 pb-2.5 pt-3.5">
          {title && <Text className="text-sm font-medium">{title}</Text>}
          {currency && (
            <View className="rounded-xl bg-orange-500/10 px-2 py-0.5">
              <Text className="text-xs font-medium text-orange-500">{currency}</Text>
            </View>
          )}
        </View>
      )}
      {children}
    </View>
  );
};
