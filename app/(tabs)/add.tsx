import { Stack, Link } from 'expo-router';
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@roninoss/icons';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';

export default function AddScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Add New' }} />
      <Container>
        <View className="flex-1 items-center justify-center p-4">
          <Link href="/modal" asChild>
            <TouchableOpacity className="w-full flex-row items-center justify-center rounded-lg bg-primary p-4">
              <Icon name="plus" size={24} color="#fff" />
              <Text className="ml-2 text-lg font-semibold text-white">Add Subscription</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Container>
    </>
  );
}
