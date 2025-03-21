import { Stack } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';

export default function AddScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Add New' }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-bold">Add New Content</Text>
        </View>
      </Container>
    </>
  );
}
