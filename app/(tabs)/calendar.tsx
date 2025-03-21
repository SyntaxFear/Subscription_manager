import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

export default function CalendarScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Calendar' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/calendar.tsx" title="Calendar" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
