import { useActionSheet } from '@expo/react-native-action-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import * as React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LucideIcons from 'lucide-react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useHeaderSearchBar } from '~/lib/useHeaderSearchBar';
import { cancelSubscriptionNotification } from '~/lib/notifications';

// Define subscription type
interface Subscription {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  startDate: string;
  interval: string;
  reminder: string;
  createdAt: string;
}

// Orange brand color
const ORANGE_COLOR = '#FF8000';

// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

// Interval map for display
const INTERVAL_DISPLAY: Record<string, string> = {
  '30': 'Monthly',
  '7': 'Weekly',
  '365': 'Yearly',
  '90': 'Quarterly',
  '14': 'Bi-weekly',
  '60': 'Bi-monthly',
  '1': 'Daily',
};

export default function Home() {
  const { colors } = useColorScheme();
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();
  const searchValue = useHeaderSearchBar({ hideWhenScrolling: subscriptions.length === 0 });

  // Filter subscriptions based on search
  const filteredData = searchValue
    ? subscriptions.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchValue.toLowerCase())
      )
    : subscriptions;

  // Load subscriptions from AsyncStorage
  const loadSubscriptions = React.useCallback(async () => {
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

  // Check for refresh flag
  const checkRefreshFlag = React.useCallback(async () => {
    try {
      const refreshFlag = await AsyncStorage.getItem('@Subs:refreshHome');
      if (refreshFlag === 'true') {
        // Clear the flag
        await AsyncStorage.removeItem('@Subs:refreshHome');
        // Refresh the subscriptions
        loadSubscriptions();
      }
    } catch (error) {
      console.error('Error checking refresh flag:', error);
    }
  }, [loadSubscriptions]);

  // Load subscriptions on mount
  React.useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Set up focus effect to refresh the list when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      checkRefreshFlag();
    }, [checkRefreshFlag])
  );

  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Navigate to add subscription
  const handleAddSubscription = () => {
    router.push('/modal');
  };

  // Delete subscription
  const handleDeleteSubscription = async (id: string) => {
    try {
      // Get existing subscriptions
      const data = await AsyncStorage.getItem('@Subs:subscriptions');
      const existingData = data ? JSON.parse(data) : [];

      // Filter out the subscription to delete
      const updatedData = existingData.filter((sub: Subscription) => sub.id !== id);

      // Save updated data
      await AsyncStorage.setItem('@Subs:subscriptions', JSON.stringify(updatedData));

      // Cancel notifications for the deleted subscription
      await cancelSubscriptionNotification(id);

      // Refresh subscriptions
      loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // Show delete confirmation
  const confirmDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete "${name}"?`)) {
        handleDeleteSubscription(id);
      }
    } else {
      Alert.alert('Delete Subscription', `Are you sure you want to delete "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteSubscription(id) },
      ]);
    }
  };

  // Navigate to edit subscription
  const handleEditSubscription = (subscription: Subscription) => {
    // Store the subscription to edit
    AsyncStorage.setItem('@Subs:editSubscription', JSON.stringify(subscription))
      .then(() => {
        router.push('/modal?edit=true');
      })
      .catch((error) => {
        console.error('Error storing subscription to edit:', error);
      });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Your Subscriptions' }} />
      <Container>
        <FlashList
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          data={filteredData}
          estimatedItemSize={100}
          contentContainerClassName="py-8"
          contentContainerStyle={{ paddingBottom: 100 }}
          extraData={searchValue}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onEdit={() => handleEditSubscription(item)}
              onDelete={() => confirmDelete(item.id, item.name)}
            />
          )}
          ListEmptyComponent={!loading ? <EmptySubscriptions /> : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ORANGE_COLOR}
              colors={[ORANGE_COLOR]}
            />
          }
        />
      </Container>
    </>
  );
}

// Subscription card component
function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors } = useColorScheme();
  const startDate = new Date(subscription.startDate);
  const nextBillingDate = new Date(startDate);
  const today = new Date();

  // Calculate next billing date
  const intervalDays = parseInt(subscription.interval);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const daysElapsed = daysSinceStart % intervalDays;
  const daysUntilNext = intervalDays - daysElapsed;

  nextBillingDate.setDate(today.getDate() + daysUntilNext);

  // Get currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[subscription.currency] || subscription.currency;

  // Get interval display text
  const intervalText =
    INTERVAL_DISPLAY[subscription.interval] || `Every ${subscription.interval} days`;

  // Get category color
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

  // Handle long press
  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Edit', 'Delete', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
          title: subscription.name,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onEdit();
          } else if (buttonIndex === 1) {
            onDelete();
          }
        }
      );
    } else {
      // For Android and other platforms
      Alert.alert(subscription.name, 'What would you like to do?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: onEdit },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={handleLongPress}
      style={styles.cardContainer}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Category indicator */}
        <View
          style={[
            styles.categoryIndicator,
            { backgroundColor: getCategoryColor(subscription.category) },
          ]}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleAndCategory}>
              <Text variant="title3" className="font-semibold">
                {subscription.name}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(subscription.category) },
                ]}>
                <Text style={styles.categoryText} className="text-xs capitalize">
                  {subscription.category}
                </Text>
              </View>
            </View>
            <Text variant="title3" className="font-semibold" style={{ color: ORANGE_COLOR }}>
              {currencySymbol}
              {subscription.price.toFixed(2)}
            </Text>
          </View>

          {subscription.description ? (
            <Text
              variant="subhead"
              color="tertiary"
              numberOfLines={1}
              ellipsizeMode="tail"
              className="mb-2">
              {subscription.description}
            </Text>
          ) : null}

          <View style={styles.cardMeta}>
            <View style={styles.metaItemGroup}>
              <View style={styles.metaItem}>
                <LucideIcons.Calendar size={12} color={colors.grey2} />
                <Text variant="caption2" color="tertiary" className="ml-1">
                  {intervalText}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <LucideIcons.Clock size={12} color={colors.grey2} />
                <Text variant="caption2" color="tertiary" className="ml-1">
                  {daysUntilNext} days left
                </Text>
              </View>
            </View>

            <View style={styles.nextDate}>
              <Text variant="caption2" color="tertiary" className="text-right">
                Next: {nextBillingDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Empty state component
function EmptySubscriptions() {
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { colors } = useColorScheme();
  const router = useRouter();
  const height = dimensions.height - headerHeight - insets.bottom - insets.top;

  return (
    <View style={{ height }} className="flex-1 items-center justify-center gap-2 px-12">
      <View style={styles.emptyIconContainer}>
        <LucideIcons.CreditCard size={32} color="#FFFFFF" />
      </View>
      <Text variant="title3" className="pb-1 text-center font-semibold">
        No Subscriptions Yet
      </Text>
      <Text color="tertiary" variant="subhead" className="pb-4 text-center">
        Add your first subscription to start tracking your expenses.
      </Text>
      <TouchableOpacity
        style={[styles.addFirstButton, { backgroundColor: ORANGE_COLOR }]}
        activeOpacity={0.7}
        onPress={() => router.push('/modal')}>
        <View style={styles.addFirstButtonContent}>
          {/* <LucideIcons.Plus size={18} color="#FFFFFF" /> */}
          <Text style={{ color: '#FFFFFF', marginLeft: 6 }} className="font-medium">
            Add Subscription
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingLeft: 18,
  },
  categoryIndicator: {
    width: 3,
    height: '200%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAndCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '70%',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  metaItemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextDate: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addFirstButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyIconContainer: {
    backgroundColor: ORANGE_COLOR,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: ORANGE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
