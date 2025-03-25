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

    // Send immediate confirmation notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Subscription Added',
        body: `${subscription.name} has been added. You will be notified ${subscription.reminder} days before each payment.`,
        data: { subscriptionId: subscription.id },
      },
      trigger: null, // null means send immediately
      identifier: `subscription-${subscription.id}-confirmation`,
    });

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

  // Calculate number of intervals to schedule based on subscription interval
  let numberOfIntervals;
  switch (intervalDays) {
    case 1: // Daily
      numberOfIntervals = 30; // One month of daily notifications
      break;
    case 3: // Every 3 days
      numberOfIntervals = 10; // One month of notifications
      break;
    case 7: // Weekly
      numberOfIntervals = 52; // One year of weekly notifications
      break;
    case 14: // Bi-weekly
      numberOfIntervals = 26; // One year of bi-weekly notifications
      break;
    case 30: // Monthly
      numberOfIntervals = 12; // One year of monthly notifications
      break;
    case 90: // Quarterly
      numberOfIntervals = 4; // One year of quarterly notifications
      break;
    case 365: // Yearly
      numberOfIntervals = 1; // One yearly notification
      break;
    default: // Custom interval
      numberOfIntervals = Math.floor(365 / intervalDays); // One year of custom interval notifications
  }

  // Get the next payment date
  const startDate = new Date(subscription.startDate);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const daysElapsed = daysSinceStart % intervalDays;
  const daysUntilNext = intervalDays - daysElapsed;
  const nextPaymentDate = new Date(today);
  nextPaymentDate.setDate(today.getDate() + daysUntilNext);

  // Schedule notifications for the calculated number of intervals
  for (let i = 0; i < numberOfIntervals; i++) {
    // Calculate the payment date for this interval
    const paymentDate = new Date(nextPaymentDate);
    paymentDate.setDate(nextPaymentDate.getDate() + intervalDays * i);

    // Calculate notification date (before the payment date)
    const notificationDate = new Date(paymentDate);
    notificationDate.setDate(paymentDate.getDate() - reminderDays);

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
