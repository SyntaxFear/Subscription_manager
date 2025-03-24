import { Stack } from 'expo-router';
import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Icon } from '@roninoss/icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useColorScheme } from '~/lib/useColorScheme';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { DatePicker } from '~/components/nativewindui/DatePicker';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';

// Theme colors
const ORANGE_COLOR = '#FF8000';
const ORANGE_LIGHT = '#FFEBCC';

// Storage keys
const SUBSCRIPTION_INTERVAL_KEY = '@Subs:subscriptionInterval';
const DEFAULT_CURRENCY_KEY = '@Subs:defaultCurrency';
const CUSTOM_INTERVAL_DISPLAY_KEY = '@Subs:customIntervalDisplay';
const REMINDER_DAYS_KEY = '@Subs:reminderDays';
const CUSTOM_REMINDER_DAYS_KEY = '@Subs:customReminderDays';
const CUSTOM_INTERVAL_DAYS_KEY = '@Subs:customIntervalDays';
const NOTIFICATION_TIME_KEY = '@Subs:notificationTime';

// Subscription interval options
export const SUBSCRIPTION_INTERVALS = [
  { label: '1 Day', value: '1' },
  { label: '3 Days', value: '3' },
  { label: '7 Days', value: '7' },
  { label: '14 Days', value: '14' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
  { label: '365 Days', value: '365' },
];

// Currency options
export const CURRENCIES = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'GEL (₾)', value: 'GEL' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

// Reminder days options
export const REMINDER_DAYS_OPTIONS = [
  { label: '1 Day', value: '1' },
  { label: '3 Days', value: '3' },
  { label: '7 Days', value: '7' },
];

// Time options for notifications (24-hour format)
export const NOTIFICATION_HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    label: `${displayHour}:00 ${period}`,
    value: hour.toString().padStart(2, '0') + ':00',
  };
});

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme, colors } = useColorScheme();
  const [interval, setInterval] = React.useState('30 Days');
  const [currency, setCurrency] = React.useState('USD');
  const [customIntervalDisplay, setCustomIntervalDisplay] = React.useState('');
  const [customIntervalDays, setCustomIntervalDays] = React.useState('');
  const [reminderDays, setReminderDays] = React.useState('1');
  const [customReminderDays, setCustomReminderDays] = React.useState('');
  const [notificationTime, setNotificationTime] = React.useState('09:00'); // Default to 9:00 AM
  const [timePickerDate, setTimePickerDate] = React.useState(new Date());
  const [showAndroidTimePicker, setShowAndroidTimePicker] = React.useState(false);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const intervalSheetRef = useSheetRef();
  const currencySheetRef = useSheetRef();
  const reminderDaysSheetRef = useSheetRef();
  const customReminderDaysSheetRef = useSheetRef();
  const customIntervalDaysSheetRef = useSheetRef();
  const notificationTimeSheetRef = useSheetRef();

  // Use orange as the primary color instead of the default blue
  const themeColors = React.useMemo(
    () => ({
      ...colors,
      primary: ORANGE_COLOR,
      accentLight: ORANGE_LIGHT,
    }),
    [colors]
  );

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        section: {
          marginTop: 35,
          backgroundColor: colors.card,
          borderRadius: 10,
          overflow: 'hidden',
          marginHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: colorScheme === 'dark' ? 0.1 : 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        settingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.grey4,
        },
        label: {
          fontSize: 17,
          color: colors.foreground,
          fontWeight: '400',
        },
        value: {
          fontSize: 17,
          color: themeColors.primary,
          marginRight: 8,
          fontWeight: '500',
        },
        sheetContent: {
          padding: 16,
        },
        sheetOption: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.grey5,
        },
        sheetOptionText: {
          fontSize: 17,
          color: colors.foreground,
          fontWeight: '400',
        },
        selectedOption: {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 128, 0, 0.2)' : ORANGE_LIGHT,
        },
        footer: {
          padding: 24,
          marginTop: 16,
          marginBottom: 40,
        },
        heading: {
          fontSize: 13,
          fontWeight: '600',
          marginBottom: 8,
          marginTop: 16,
          color: colors.grey2,
          textTransform: 'uppercase',
          marginLeft: 16,
        },
        customSheetInput: {
          borderWidth: 1,
          borderColor: colors.grey4,
          borderRadius: 10,
          backgroundColor: colorScheme === 'dark' ? colors.card : colors.background,
          padding: 8,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        textInput: {
          flex: 1,
          fontSize: 17,
          color: colors.foreground,
          padding: 10,
          fontWeight: '400',
        },
        button: {
          backgroundColor: themeColors.primary,
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        buttonText: {
          color: 'white',
          fontWeight: '600',
          fontSize: 16,
        },
      }),
    [colors, themeColors, colorScheme]
  );

  // Load saved settings
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedInterval = await AsyncStorage.getItem(SUBSCRIPTION_INTERVAL_KEY);
        if (savedInterval) {
          // Convert stored value to match case with our current options
          const matchingInterval = SUBSCRIPTION_INTERVALS.find(
            (i) => i.value.toLowerCase() === savedInterval.toLowerCase()
          );
          setInterval(matchingInterval ? matchingInterval.value : 'monthly');
        }

        const savedCurrency = await AsyncStorage.getItem(DEFAULT_CURRENCY_KEY);
        if (savedCurrency) setCurrency(savedCurrency);

        const savedCustomDisplay = await AsyncStorage.getItem(CUSTOM_INTERVAL_DISPLAY_KEY);
        if (savedCustomDisplay) setCustomIntervalDisplay(savedCustomDisplay);

        const savedCustomIntervalDays = await AsyncStorage.getItem(CUSTOM_INTERVAL_DAYS_KEY);
        if (savedCustomIntervalDays) setCustomIntervalDays(savedCustomIntervalDays);

        const savedReminderDays = await AsyncStorage.getItem(REMINDER_DAYS_KEY);
        if (savedReminderDays) setReminderDays(savedReminderDays);

        const savedCustomReminderDays = await AsyncStorage.getItem(CUSTOM_REMINDER_DAYS_KEY);
        if (savedCustomReminderDays) setCustomReminderDays(savedCustomReminderDays);

        const savedNotificationTime = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
        if (savedNotificationTime) {
          setNotificationTime(savedNotificationTime);
          // Set the time picker date to match the saved time
          const date = new Date();
          if (savedNotificationTime.includes(':')) {
            const [hours, minutes] = savedNotificationTime.split(':');
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
          } else {
            // Handle legacy format (hour only)
            date.setHours(parseInt(savedNotificationTime, 10));
            date.setMinutes(0);
          }
          setTimePickerDate(date);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    loadSettings();
  }, []);

  // Watch for interval changes and show modal if custom is selected
  React.useEffect(() => {
    if (interval === 'custom') {
      customIntervalDaysSheetRef.current?.present();

      // Setup a proper handler for when the sheet is closed without entering a value
      const modalRef = customIntervalDaysSheetRef.current;
      if (modalRef) {
        // Use a timeout to ensure this runs after modal is presented
        setTimeout(() => {
          try {
            // Override the dismiss and close methods to handle cancellation properly
            const originalDismiss = modalRef.dismiss;
            const originalClose = modalRef.close;

            const handleDismissal = () => {
              // If the user selected custom but didn't enter a value, default to daily (1 day)
              if (interval === 'custom' && !customIntervalDays) {
                setInterval('daily');
                setCustomIntervalDisplay('');
                AsyncStorage.setItem(SUBSCRIPTION_INTERVAL_KEY, 'daily');
                AsyncStorage.removeItem(CUSTOM_INTERVAL_DAYS_KEY);
                AsyncStorage.removeItem(CUSTOM_INTERVAL_DISPLAY_KEY);
              }
            };

            modalRef.dismiss = (...args) => {
              handleDismissal();
              return originalDismiss.apply(modalRef, args);
            };

            modalRef.close = (...args) => {
              handleDismissal();
              return originalClose.apply(modalRef, args);
            };
          } catch (error) {
            console.error('Failed to override sheet methods', error);
          }
        }, 100);
      }
    }
  }, [interval, customIntervalDays]);

  // Watch for reminder days changes and show input if custom is selected
  React.useEffect(() => {
    if (reminderDays === 'custom') {
      customReminderDaysSheetRef.current?.present();

      // Setup a proper handler for when the sheet is closed without entering a value
      const modalRef = customReminderDaysSheetRef.current;
      if (modalRef) {
        // Use a timeout to ensure this runs after modal is presented
        setTimeout(() => {
          try {
            // Override the dismiss and close methods to handle cancellation properly
            const originalDismiss = modalRef.dismiss;
            const originalClose = modalRef.close;

            const handleDismissal = () => {
              // If the user selected custom but didn't enter a value, default to 1 day
              if (reminderDays === 'custom' && !customReminderDays) {
                setReminderDays('1');
                setCustomReminderDays('');
                AsyncStorage.setItem(REMINDER_DAYS_KEY, '1');
                AsyncStorage.removeItem(CUSTOM_REMINDER_DAYS_KEY);
              }
            };

            modalRef.dismiss = (...args) => {
              handleDismissal();
              return originalDismiss.apply(modalRef, args);
            };

            modalRef.close = (...args) => {
              handleDismissal();
              return originalClose.apply(modalRef, args);
            };
          } catch (error) {
            console.error('Failed to override sheet methods', error);
          }
        }, 100);
      }
    }
  }, [reminderDays, customReminderDays]);

  // Save subscription interval
  const handleIntervalChange = async (value: string) => {
    setInterval(value);
    intervalSheetRef.current?.dismiss();

    try {
      await AsyncStorage.setItem(SUBSCRIPTION_INTERVAL_KEY, value);

      // If it's not custom, clear any custom interval data
      if (value !== 'custom') {
        setCustomIntervalDays('');
        setCustomIntervalDisplay('');
        await AsyncStorage.removeItem(CUSTOM_INTERVAL_DAYS_KEY);
        await AsyncStorage.removeItem(CUSTOM_INTERVAL_DISPLAY_KEY);
      }
    } catch (error) {
      console.error('Failed to save subscription interval', error);
    }
  };

  // Save default currency
  const handleCurrencyChange = async (value: string) => {
    setCurrency(value);
    currencySheetRef.current?.dismiss();
    try {
      await AsyncStorage.setItem(DEFAULT_CURRENCY_KEY, value);
    } catch (error) {
      console.error('Failed to save default currency', error);
    }
  };

  // Save reminder days
  const handleReminderDaysChange = async (value: string) => {
    setReminderDays(value);
    reminderDaysSheetRef.current?.dismiss();

    try {
      await AsyncStorage.setItem(REMINDER_DAYS_KEY, value);

      // If it's not custom, clear any custom days that were set
      if (value !== 'custom') {
        setCustomReminderDays('');
        await AsyncStorage.removeItem(CUSTOM_REMINDER_DAYS_KEY);
      }
    } catch (error) {
      console.error('Failed to save reminder days', error);
    }
  };

  // Save custom reminder days
  const handleCustomReminderDaysSave = async (days: string) => {
    if (days && !isNaN(Number(days))) {
      setCustomReminderDays(days);
      customReminderDaysSheetRef.current?.dismiss();

      try {
        await AsyncStorage.setItem(CUSTOM_REMINDER_DAYS_KEY, days);
      } catch (error) {
        console.error('Failed to save custom reminder days', error);
      }
    } else {
      // If invalid, revert to 1 day
      setReminderDays('1');
      setCustomReminderDays('');
      customReminderDaysSheetRef.current?.dismiss();

      try {
        await AsyncStorage.setItem(REMINDER_DAYS_KEY, '1');
        await AsyncStorage.removeItem(CUSTOM_REMINDER_DAYS_KEY);
      } catch (error) {
        console.error('Failed to revert reminder days', error);
      }
    }
  };

  // Save custom interval days
  const handleCustomIntervalDaysSave = async (days: string) => {
    if (days && !isNaN(Number(days))) {
      setCustomIntervalDays(days);
      customIntervalDaysSheetRef.current?.dismiss();

      // Create display format
      const daysNum = parseInt(days, 10);
      const displayText = daysNum === 1 ? `1 day` : `${daysNum} days`;
      setCustomIntervalDisplay(displayText);

      try {
        await AsyncStorage.setItem(CUSTOM_INTERVAL_DAYS_KEY, days);
        await AsyncStorage.setItem(CUSTOM_INTERVAL_DISPLAY_KEY, displayText);
      } catch (error) {
        console.error('Failed to save custom interval days', error);
      }
    } else {
      // If invalid, revert to daily (1 day)
      setInterval('daily');
      customIntervalDaysSheetRef.current?.dismiss();

      try {
        await AsyncStorage.setItem(SUBSCRIPTION_INTERVAL_KEY, 'daily');
        await AsyncStorage.removeItem(CUSTOM_INTERVAL_DAYS_KEY);
        await AsyncStorage.removeItem(CUSTOM_INTERVAL_DISPLAY_KEY);
      } catch (error) {
        console.error('Failed to revert interval', error);
      }
    }
  };

  // Save notification time
  const handleNotificationTimeChange = async (value: string) => {
    setNotificationTime(value);
    notificationTimeSheetRef.current?.dismiss();

    try {
      await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, value);
    } catch (error) {
      console.error('Failed to save notification time', error);
    }
  };

  // Handle time change from DatePicker
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowAndroidTimePicker(false);

    if (selectedDate) {
      setTimePickerDate(selectedDate);
      const hour = selectedDate.getHours().toString().padStart(2, '0');
      const minute = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hour}:${minute}`;
      setNotificationTime(timeString);

      if (Platform.OS === 'android') {
        // On Android, we need to save the time when the user selects it
        AsyncStorage.setItem(NOTIFICATION_TIME_KEY, timeString).catch((error) => {
          console.error('Failed to save notification time', error);
        });
      }
    }
  };

  // For iOS, save time when sheet is dismissed
  const handleTimePickerDismiss = () => {
    if (Platform.OS === 'ios') {
      AsyncStorage.setItem(NOTIFICATION_TIME_KEY, notificationTime).catch((error) => {
        console.error('Failed to save notification time', error);
      });
    }
  };

  // Format the time for display
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString.includes(':')) {
      return (
        NOTIFICATION_HOURS.find((t) => t.value.split(':')[0] === timeString)?.label ||
        `${timeString}:00`
      );
    }

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: themeColors.primary },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.heading}>Appearance</Text>
          <View style={styles.settingRow}>
            <Text style={styles.label}>Dark Mode</Text>
            <Toggle
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              customTrackColor={themeColors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Subscription Settings</Text>

          <Pressable style={styles.settingRow} onPress={() => intervalSheetRef.current?.present()}>
            <Text style={styles.label}>Subscription Interval</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>
                {interval === 'custom' && customIntervalDays
                  ? `${customIntervalDays} ${parseInt(customIntervalDays, 10) === 1 ? 'Day' : 'Days'}`
                  : SUBSCRIPTION_INTERVALS.find((i) => i.value === interval)?.label || interval}
              </Text>
              <Icon name="chevron-right" color={themeColors.primary} size={20} />
            </View>
          </Pressable>

          <Pressable style={styles.settingRow} onPress={() => currencySheetRef.current?.present()}>
            <Text style={styles.label}>Currency</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>
                {CURRENCIES.find((c) => c.value === currency)?.label || currency}
              </Text>
              <Icon name="chevron-right" color={themeColors.primary} size={20} />
            </View>
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={() => reminderDaysSheetRef.current?.present()}>
            <Text style={styles.label}>Reminder Days Before</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>
                {reminderDays === 'custom' && customReminderDays
                  ? `${customReminderDays} ${parseInt(customReminderDays, 10) === 1 ? 'Day' : 'Days'}`
                  : REMINDER_DAYS_OPTIONS.find((r) => r.value === reminderDays)?.label ||
                    reminderDays}
              </Text>
              <Icon name="chevron-right" color={themeColors.primary} size={20} />
            </View>
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={() => {
              if (Platform.OS === 'ios') {
                notificationTimeSheetRef.current?.present();
              } else {
                // On Android, show the time picker directly
                const currentDate = new Date();
                if (notificationTime.includes(':')) {
                  const [hours, minutes] = notificationTime.split(':');
                  currentDate.setHours(parseInt(hours, 10));
                  currentDate.setMinutes(parseInt(minutes, 10));
                } else {
                  // Handle legacy format
                  currentDate.setHours(parseInt(notificationTime, 10));
                  currentDate.setMinutes(0);
                }
                setTimePickerDate(currentDate);
                setShowAndroidTimePicker(true);
              }
            }}>
            <Text style={styles.label}>Notification Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>{formatTimeForDisplay(notificationTime)}</Text>
              <Icon name="chevron-right" color={themeColors.primary} size={20} />
            </View>
          </Pressable>

          {/* Show Android native time picker when needed */}
          {showAndroidTimePicker && Platform.OS === 'android' && (
            <DatePicker
              value={timePickerDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.sheetOptionText,
              { textAlign: 'center', textDecorationLine: 'underline' },
            ]}
            onPress={() => Linking.openURL('https://example.com/terms')}>
            Terms & Conditions
          </Text>
          <Text
            style={[
              styles.sheetOptionText,
              { textAlign: 'center', fontSize: 14, marginTop: 8, opacity: 0.6 },
            ]}>
            Version {appVersion}
          </Text>
        </View>

        {/* Interval Selection Sheet */}
        <Sheet ref={intervalSheetRef} snapPoints={['50%']} customHandleColor={themeColors.primary}>
          <BottomSheetView style={{ flex: 1 }}>
            <View style={{ paddingVertical: 16 }}>
              {SUBSCRIPTION_INTERVALS.map((item) => (
                <Pressable
                  key={item.value}
                  style={[styles.sheetOption, interval === item.value && styles.selectedOption]}
                  onPress={() => handleIntervalChange(item.value)}>
                  <Text style={styles.sheetOptionText}>{item.label}</Text>
                  {interval === item.value && (
                    <Icon name="check" color={themeColors.primary} size={20} />
                  )}
                </Pressable>
              ))}
            </View>
          </BottomSheetView>
        </Sheet>

        {/* Currency Selection Sheet */}
        <Sheet ref={currencySheetRef} snapPoints={['35%']} customHandleColor={themeColors.primary}>
          <BottomSheetView style={{ flex: 1 }}>
            <View style={{ paddingVertical: 16 }}>
              {CURRENCIES.map((item) => (
                <Pressable
                  key={item.value}
                  style={[styles.sheetOption, currency === item.value && styles.selectedOption]}
                  onPress={() => handleCurrencyChange(item.value)}>
                  <Text style={styles.sheetOptionText}>{item.label}</Text>
                  {currency === item.value && (
                    <Icon name="check" color={themeColors.primary} size={20} />
                  )}
                </Pressable>
              ))}
            </View>
          </BottomSheetView>
        </Sheet>

        {/* Reminder Days Selection Sheet */}
        <Sheet
          ref={reminderDaysSheetRef}
          snapPoints={['30%']}
          customHandleColor={themeColors.primary}>
          <BottomSheetView style={{ flex: 1 }}>
            <View style={{ paddingVertical: 16 }}>
              {REMINDER_DAYS_OPTIONS.map((item) => (
                <Pressable
                  key={item.value}
                  style={[styles.sheetOption, reminderDays === item.value && styles.selectedOption]}
                  onPress={() => handleReminderDaysChange(item.value)}>
                  <Text style={styles.sheetOptionText}>{item.label}</Text>
                  {reminderDays === item.value && (
                    <Icon name="check" color={themeColors.primary} size={20} />
                  )}
                </Pressable>
              ))}
            </View>
          </BottomSheetView>
        </Sheet>

        {/* Notification Time Selection Sheet (for iOS) */}
        <Sheet
          ref={notificationTimeSheetRef}
          snapPoints={['40%']}
          customHandleColor={themeColors.primary}
          onDismiss={handleTimePickerDismiss}>
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
            <Text
              style={[
                styles.sheetOptionText,
                { fontWeight: '600', marginBottom: 8, fontSize: 18 },
              ]}>
              Select Notification Time
            </Text>

            {Platform.OS === 'ios' && (
              <DatePicker
                value={timePickerDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant={colorScheme}
                style={{ flex: 1, marginTop: -8 }}
              />
            )}

            {Platform.OS === 'android' && (
              <View style={{ flex: 1 }}>
                <Picker
                  selectedValue={notificationTime}
                  onValueChange={(itemValue) => handleNotificationTimeChange(itemValue.toString())}>
                  {NOTIFICATION_HOURS.map((item) => (
                    <PickerItem key={item.value} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>
            )}
          </BottomSheetView>
        </Sheet>
      </ScrollView>
    </>
  );
}
