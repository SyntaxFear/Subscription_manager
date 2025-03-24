import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActionSheetIOS,
} from 'react-native';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import ContextMenu from 'react-native-context-menu-view';
import { scheduleSubscriptionNotification } from '~/lib/notifications';

import { Text } from '~/components/nativewindui/Text';
import { DatePicker } from '~/components/nativewindui/DatePicker';
import { useColorScheme } from '~/lib/useColorScheme';
import { CURRENCIES, SUBSCRIPTION_INTERVALS, REMINDER_DAYS_OPTIONS } from '~/app/(tabs)/settings';

// Theme colors
const ORANGE_COLOR = '#FF8000';

// Default constants
const CATEGORIES = [
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Tech', value: 'tech' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Health', value: 'health' },
  { label: 'Food & Dining', value: 'food' },
  { label: 'Music', value: 'music' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Travel', value: 'travel' },
  { label: 'Social', value: 'social' },
  { label: 'News', value: 'news' },
  { label: 'Other', value: 'other' },
];

// Currency symbols map
const CURRENCY_SYMBOLS = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
  GBP: '£',
};

export default function Modal() {
  const { colors, colorScheme } = useColorScheme();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('other');
  const [price, setPrice] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [startDate, setStartDate] = React.useState(new Date());
  const [interval, setInterval] = React.useState('30');
  const [reminder, setReminder] = React.useState('3');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const params = useLocalSearchParams();

  // Platform check
  const isIOS = Platform.OS === 'ios';

  // Theme colors override
  const themeColors = React.useMemo(
    () => ({
      ...colors,
      primary: ORANGE_COLOR,
    }),
    [colors]
  );

  // Load saved defaults from settings or existing subscription if editing
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Check if we're editing an existing subscription
        if (params.edit === 'true') {
          setIsEditing(true);
          const editData = await AsyncStorage.getItem('@Subs:editSubscription');

          if (editData) {
            const subscription = JSON.parse(editData);
            setName(subscription.name);
            setDescription(subscription.description || '');
            setCategory(subscription.category);
            setPrice(subscription.price.toString());
            setCurrency(subscription.currency);
            setStartDate(new Date(subscription.startDate));
            setInterval(subscription.interval);
            setReminder(subscription.reminder);
            setEditId(subscription.id);
          }
        } else {
          // Load defaults for new subscription
          const defaultCurrency = await AsyncStorage.getItem('@Subs:defaultCurrency');
          const defaultInterval = await AsyncStorage.getItem('@Subs:subscriptionInterval');
          const defaultReminderDays = await AsyncStorage.getItem('@Subs:reminderDays');

          if (defaultCurrency) setCurrency(defaultCurrency);
          if (defaultInterval) setInterval(defaultInterval);
          if (defaultReminderDays) setReminder(defaultReminderDays);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.edit]);

  // Handle category selection
  const showCategoryActionSheet = () => {
    if (isIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...CATEGORIES.map((item) => item.label), 'Cancel'],
          cancelButtonIndex: CATEGORIES.length,
          title: 'Select Category',
        },
        (buttonIndex) => {
          if (buttonIndex !== CATEGORIES.length) {
            setCategory(CATEGORIES[buttonIndex].value);
          }
        }
      );
    }
  };

  // Handle interval selection
  const showIntervalActionSheet = () => {
    if (isIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...SUBSCRIPTION_INTERVALS.map((item) => item.label), 'Cancel'],
          cancelButtonIndex: SUBSCRIPTION_INTERVALS.length,
          title: 'Select Interval',
        },
        (buttonIndex) => {
          if (buttonIndex !== SUBSCRIPTION_INTERVALS.length) {
            setInterval(SUBSCRIPTION_INTERVALS[buttonIndex].value);
          }
        }
      );
    }
  };

  // Handle reminder selection
  const showReminderActionSheet = () => {
    if (isIOS) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...REMINDER_DAYS_OPTIONS.map((item) => item.label), 'Cancel'],
          cancelButtonIndex: REMINDER_DAYS_OPTIONS.length,
          title: 'Select Reminder',
        },
        (buttonIndex) => {
          if (buttonIndex !== REMINDER_DAYS_OPTIONS.length) {
            setReminder(REMINDER_DAYS_OPTIONS[buttonIndex].value);
          }
        }
      );
    }
  };

  const handleAddSubscription = async () => {
    try {
      // Create subscription object with all form data
      const subscriptionData = {
        id: editId || Date.now().toString(), // Use existing ID if editing
        name,
        description,
        category,
        price: parseFloat(price) || 0,
        currency,
        startDate: startDate.toISOString(),
        interval,
        reminder,
        createdAt: isEditing ? new Date().toISOString() : new Date().toISOString(),
        updatedAt: isEditing ? new Date().toISOString() : null,
      };

      // Get existing subscriptions
      const existingDataJSON = await AsyncStorage.getItem('@Subs:subscriptions');
      const existingData = existingDataJSON ? JSON.parse(existingDataJSON) : [];

      let updatedData;

      if (isEditing && editId) {
        // Replace the edited subscription
        updatedData = existingData.map((sub: any) => (sub.id === editId ? subscriptionData : sub));
      } else {
        // Add new subscription to existing array
        updatedData = [...existingData, subscriptionData];
      }

      // Save updated data back to AsyncStorage
      await AsyncStorage.setItem('@Subs:subscriptions', JSON.stringify(updatedData));

      // Schedule notification for the subscription
      await scheduleSubscriptionNotification(subscriptionData);

      // Clear edit data if we were editing
      if (isEditing) {
        await AsyncStorage.removeItem('@Subs:editSubscription');
      }

      // Set a flag to refresh home screen
      await AsyncStorage.setItem('@Subs:refreshHome', 'true');

      // Navigate to home page
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving subscription:', error);
      // You might want to show an error message to the user here
    }
  };

  // Create context menu actions
  const categoryActions = CATEGORIES.map((item) => ({
    title: item.label,
    systemIcon: category === item.value ? 'checkmark' : undefined,
  }));

  const intervalActions = SUBSCRIPTION_INTERVALS.map((item) => ({
    title: item.label,
    systemIcon: interval === item.value ? 'checkmark' : undefined,
  }));

  const reminderActions = REMINDER_DAYS_OPTIONS.map((item) => ({
    title: item.label,
    systemIcon: reminder === item.value ? 'checkmark' : undefined,
  }));

  const currencyActions = CURRENCIES.map((item) => ({
    title: item.label,
    systemIcon: currency === item.value ? 'checkmark' : undefined,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 100, // Add padding to account for fixed button
    },
    formContainer: {
      width: '100%',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.foreground,
      marginBottom: 8,
    },
    input: {
      width: '100%',
      fontSize: 16,
      color: colors.foreground,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    datePickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
      padding: 10,
      flex: 1,
    },
    selectionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
      padding: 12,
    },
    selectionButtonText: {
      fontSize: 16,
      color: colors.foreground,
    },
    selectedValueText: {
      color: themeColors.primary,
      fontWeight: '500',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: themeColors.foreground,
      textAlign: 'center',
    },
    fixedButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: colors.grey4,
    },
    addButton: {
      backgroundColor: themeColors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    rowContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    currencySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    currencyBubble: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.grey4,
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
    },
    selectedCurrencyBubble: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: '600',
    },
    selectedCurrencyText: {
      color: '#fff',
      fontWeight: '500',
    },
    selectionButtonHalf: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.grey4,
      borderRadius: 8,
      backgroundColor: colors.background,
      padding: 12,
      flex: 1,
    },
  });

  // Get current selection labels
  const getCategoryLabel = () => {
    const found = CATEGORIES.find((item) => item.value === category);
    return found ? found.label : 'Select Category';
  };

  const getIntervalLabel = () => {
    const found = SUBSCRIPTION_INTERVALS.find((item) => item.value === interval);
    return found ? found.label : 'Select Interval';
  };

  const getReminderLabel = () => {
    const found = REMINDER_DAYS_OPTIONS.find((item) => item.value === reminder);
    return found ? found.label : 'Select Reminder';
  };

  const getCurrencyLabel = () => {
    const found = CURRENCIES.find((item) => item.value === currency);
    return found ? found.label : 'Select Currency';
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: isEditing ? 'Edit Subscription' : 'Add New Subscription' }} />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        <View style={{ paddingBottom: 100 }}>
          <View style={{ marginBottom: 16 }}>
            <View style={styles.formContainer}>
              {/* Subscription Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Subscription Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter subscription name"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                  multiline
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                {isIOS ? (
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={showCategoryActionSheet}
                    activeOpacity={0.7}>
                    <Text style={styles.selectionButtonText}>{getCategoryLabel()}</Text>
                    <Text style={{ color: colors.grey2 }}>▼</Text>
                  </TouchableOpacity>
                ) : (
                  <ContextMenu
                    actions={categoryActions}
                    onPress={(e) => {
                      if (e.nativeEvent.index !== undefined) {
                        setCategory(CATEGORIES[e.nativeEvent.index].value);
                      }
                    }}
                    previewBackgroundColor={colors.card}>
                    <View style={styles.selectionButton}>
                      <Text style={styles.selectionButtonText}>{getCategoryLabel()}</Text>
                      <Text style={{ color: colors.grey2 }}>▼</Text>
                    </View>
                  </ContextMenu>
                )}
              </View>

              {/* Price and Currency - Same Line */}
              <View style={styles.formGroup}>
                <View style={styles.rowContainer}>
                  {/* Price */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                      style={[styles.input, { height: 50 }]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Currency */}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>Currency</Text>
                    {isIOS ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.selectionButtonHalf}
                        onPress={() => {
                          ActionSheetIOS.showActionSheetWithOptions(
                            {
                              options: [...CURRENCIES.map((item) => item.label), 'Cancel'],
                              cancelButtonIndex: CURRENCIES.length,
                              title: 'Select Currency',
                            },
                            (buttonIndex) => {
                              if (buttonIndex !== CURRENCIES.length) {
                                setCurrency(CURRENCIES[buttonIndex].value);
                              }
                            }
                          );
                        }}>
                        <Text style={styles.selectionButtonText}>{getCurrencyLabel()}</Text>
                        <Text style={{ color: colors.grey2 }}>▼</Text>
                      </TouchableOpacity>
                    ) : (
                      <ContextMenu
                        actions={currencyActions}
                        onPress={(e) => {
                          if (e.nativeEvent.index !== undefined) {
                            setCurrency(CURRENCIES[e.nativeEvent.index].value);
                          }
                        }}
                        previewBackgroundColor={colors.card}>
                        <View style={styles.selectionButtonHalf}>
                          <Text style={styles.selectionButtonText}>{getCurrencyLabel()}</Text>
                          <Text style={{ color: colors.grey2 }}>▼</Text>
                        </View>
                      </ContextMenu>
                    )}
                  </View>
                </View>
              </View>

              {/* Interval and Reminder */}
              <View style={styles.formGroup}>
                <View style={styles.rowContainer}>
                  {/* Interval */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Interval</Text>
                    {isIOS ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.selectionButtonHalf}
                        onPress={showIntervalActionSheet}>
                        <Text style={styles.selectionButtonText}>{getIntervalLabel()}</Text>
                        <Text style={{ color: colors.grey2 }}>▼</Text>
                      </TouchableOpacity>
                    ) : (
                      <ContextMenu
                        actions={intervalActions}
                        onPress={(e) => {
                          if (e.nativeEvent.index !== undefined) {
                            setInterval(SUBSCRIPTION_INTERVALS[e.nativeEvent.index].value);
                          }
                        }}
                        previewBackgroundColor={colors.card}>
                        <View style={styles.selectionButtonHalf}>
                          <Text style={styles.selectionButtonText}>{getIntervalLabel()}</Text>
                          <Text style={{ color: colors.grey2 }}>▼</Text>
                        </View>
                      </ContextMenu>
                    )}
                  </View>

                  {/* Reminder */}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.label}>Remind me before</Text>
                    {isIOS ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.selectionButtonHalf}
                        onPress={showReminderActionSheet}>
                        <Text style={styles.selectionButtonText}>{getReminderLabel()}</Text>
                        <Text style={{ color: colors.grey2 }}>▼</Text>
                      </TouchableOpacity>
                    ) : (
                      <ContextMenu
                        actions={reminderActions}
                        onPress={(e) => {
                          if (e.nativeEvent.index !== undefined) {
                            setReminder(REMINDER_DAYS_OPTIONS[e.nativeEvent.index].value);
                          }
                        }}
                        previewBackgroundColor={colors.card}>
                        <View style={styles.selectionButtonHalf}>
                          <Text style={styles.selectionButtonText}>{getReminderLabel()}</Text>
                          <Text style={{ color: colors.grey2 }}>▼</Text>
                        </View>
                      </ContextMenu>
                    )}
                  </View>
                </View>
              </View>

              {/* Start Date */}
              <View style={styles.formGroup}>
                <View style={styles.rowContainer}>
                  {/* Date Picker */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Start Date</Text>
                    <View style={[styles.datePickerContainer, { borderWidth: 0, padding: 0 }]}>
                      <DatePicker
                        value={startDate}
                        onChange={(_, date) => date && setStartDate(date)}
                        mode="date"
                        // Override the default blue color with our theme orange color
                        accentColor={themeColors.primary}
                      />
                    </View>
                  </View>

                  {/* Empty space to balance the row */}
                  <View style={{ flex: 1, marginLeft: 10 }} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Add Button at the bottom */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
          onPress={handleAddSubscription}>
          <Text style={styles.addButtonText}>
            {isEditing ? 'Save Changes' : 'Add Subscription'}
          </Text>
        </TouchableOpacity>
      </View>

      <StatusBar style={isIOS ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}
