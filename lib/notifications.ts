import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

// Schedule a notification for a subscription
export async function scheduleSubscriptionNotification(subscription: {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  startDate: string;
  reminder: string;
}) {
  try {
    // Cancel any existing notifications for this subscription
    await cancelSubscriptionNotification(subscription.id);

    const startDate = new Date(subscription.startDate);
    const intervalDays = parseInt(subscription.interval);
    const reminderDays = parseInt(subscription.reminder);
    const today = new Date();

    // Calculate days since start
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const daysElapsed = daysSinceStart % intervalDays;
    const daysUntilNext = intervalDays - daysElapsed;

    // Calculate next billing date
    const nextBillingDate = new Date(today);
    nextBillingDate.setDate(today.getDate() + daysUntilNext);

    // Calculate notification date (before the billing date)
    const notificationDate = new Date(nextBillingDate);
    notificationDate.setDate(nextBillingDate.getDate() - reminderDays);

    // Only schedule if the notification date is in the future
    if (notificationDate > today) {
      const notificationContent = {
        title: `Upcoming Subscription Payment`,
        body: `${subscription.name} - ${subscription.currency}${subscription.price.toFixed(2)} due in ${reminderDays} days`,
        data: { subscriptionId: subscription.id },
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: notificationDate,
          channelId: 'subscription-reminders',
        },
        identifier: `subscription-${subscription.id}`,
      });
    }

    // Schedule recurring notifications for future payments
    await scheduleRecurringNotifications(subscription);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

// Schedule recurring notifications for a subscription
async function scheduleRecurringNotifications(subscription: {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  startDate: string;
  reminder: string;
}) {
  const intervalDays = parseInt(subscription.interval);
  const reminderDays = parseInt(subscription.reminder);
  const today = new Date();

  // Schedule notifications for the next 12 intervals
  for (let i = 1; i <= 12; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + intervalDays * i);

    const notificationDate = new Date(futureDate);
    notificationDate.setDate(futureDate.getDate() - reminderDays);

    if (notificationDate > today) {
      const notificationContent = {
        title: `Upcoming Subscription Payment`,
        body: `${subscription.name} - ${subscription.currency}${subscription.price.toFixed(2)} due in ${reminderDays} days`,
        data: { subscriptionId: subscription.id },
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: notificationDate,
          channelId: 'subscription-reminders',
        },
        identifier: `subscription-${subscription.id}-${i}`,
      });
    }
  }
}

// Cancel notifications for a subscription
export async function cancelSubscriptionNotification(subscriptionId: string) {
  try {
    // Get all pending notifications
    const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Filter and cancel notifications for this subscription
    const subscriptionNotifications = pendingNotifications.filter((notification) =>
      notification.identifier.startsWith(`subscription-${subscriptionId}`)
    );

    for (const notification of subscriptionNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Create notification channel (Android)
export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('subscription-reminders', {
      name: 'Subscription Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF8000',
      sound: 'default',
    });
  }
}

// Initialize notifications
export async function initializeNotifications() {
  const hasPermission = await requestNotificationPermissions();
  if (hasPermission) {
    await createNotificationChannel();
  }
}
