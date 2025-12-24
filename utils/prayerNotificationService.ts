
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTime } from './prayerTimeService';

const NOTIFICATION_IDS_KEY = '@prayer_notification_ids';

/**
 * Simple prayer notification service - handles scheduling prayer notifications
 */

// Check if notifications are enabled
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error checking notification permission:', error);
    return false;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
}

// Get saved notification IDs
async function getSavedNotificationIds(): Promise<string[]> {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.log('Error reading notification IDs:', error);
    return [];
  }
}

// Save notification IDs
async function saveNotificationIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.log('Error saving notification IDs:', error);
  }
}

// Cancel all prayer notifications
export async function cancelAllPrayerNotifications(): Promise<void> {
  try {
    const ids = await getSavedNotificationIds();
    
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    console.log('All prayer notifications cancelled');
  } catch (error) {
    console.log('Error cancelling prayer notifications:', error);
  }
}

// Schedule prayer notifications
export async function schedulePrayerNotifications(prayers: PrayerTime[]): Promise<void> {
  try {
    // Check if notifications are enabled
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      console.log('Notifications not enabled, skipping scheduling');
      return;
    }

    // Cancel existing notifications
    await cancelAllPrayerNotifications();

    const notificationIds: string[] = [];
    const now = new Date();

    for (const prayer of prayers) {
      // Only schedule for future prayers
      if (prayer.date > now) {
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🕌 ${prayer.name} Prayer Time`,
              body: `It's time for ${prayer.name} prayer (${prayer.arabicName})`,
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
              categoryIdentifier: 'prayer',
              data: {
                type: 'prayer',
                prayerName: prayer.name,
              },
            },
            trigger: {
              date: prayer.date,
            },
          });

          notificationIds.push(id);
          console.log(`Scheduled notification for ${prayer.name} at ${prayer.time}`);
        } catch (error) {
          console.log(`Error scheduling notification for ${prayer.name}:`, error);
        }
      }
    }

    // Save notification IDs
    await saveNotificationIds(notificationIds);
    console.log(`Scheduled ${notificationIds.length} prayer notifications`);
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
  }
}

// Get count of scheduled notifications
export async function getScheduledNotificationCount(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch (error) {
    console.log('Error getting scheduled notification count:', error);
    return 0;
  }
}
