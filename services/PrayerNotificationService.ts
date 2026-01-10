
/**
 * PrayerNotificationService - Enhanced implementation for prayer notifications
 * Schedules notifications for each prayer time with improved error handling
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyPrayerTimes, PrayerTime } from './PrayerTimeService';
import { Platform } from 'react-native';

const NOTIFICATION_IDS_KEY = '@prayer_notification_ids';
const LAST_SCHEDULED_DATE_KEY = '@last_scheduled_date';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions with proper Android 13+ handling
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    console.log('🔔 Requesting notification permission...');
    
    // For Android, set up notification channels first
    if (Platform.OS === 'android') {
      await setupAndroidNotificationChannels();
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📱 Existing notification permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📱 New notification permission status:', finalStatus);
    }
    
    const granted = finalStatus === 'granted';
    console.log(granted ? '✅ Notification permission granted' : '❌ Notification permission denied');
    
    return granted;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Setup Android notification channels
 */
async function setupAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  
  try {
    console.log('📱 Setting up Android notification channels...');
    
    // Prayer notifications channel
    await Notifications.setNotificationChannelAsync('prayer', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
    
    // Prayer reminder channel
    await Notifications.setNotificationChannelAsync('prayer_reminder', {
      name: 'Prayer Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
    
    console.log('✅ Android notification channels set up');
  } catch (error) {
    console.error('❌ Error setting up Android notification channels:', error);
  }
}

/**
 * Check if notification permission is granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('❌ Error checking notification permission:', error);
    return false;
  }
}

/**
 * Get saved notification IDs
 */
async function getSavedNotificationIds(): Promise<string[]> {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('❌ Error reading notification IDs:', error);
    return [];
  }
}

/**
 * Save notification IDs
 */
async function saveNotificationIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    console.log('✅ Saved notification IDs:', ids.length);
  } catch (error) {
    console.error('❌ Error saving notification IDs:', error);
  }
}

/**
 * Get last scheduled date
 */
async function getLastScheduledDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SCHEDULED_DATE_KEY);
  } catch (error) {
    console.error('❌ Error reading last scheduled date:', error);
    return null;
  }
}

/**
 * Save last scheduled date
 */
async function saveLastScheduledDate(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SCHEDULED_DATE_KEY, date);
    console.log('✅ Saved last scheduled date:', date);
  } catch (error) {
    console.error('❌ Error saving last scheduled date:', error);
  }
}

/**
 * Cancel all scheduled prayer notifications
 */
export async function cancelAllPrayerNotifications(): Promise<void> {
  try {
    console.log('🗑️ Cancelling all prayer notifications...');
    
    const ids = await getSavedNotificationIds();
    
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (error) {
        console.warn('⚠️ Failed to cancel notification:', id, error);
      }
    }

    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    await AsyncStorage.removeItem(LAST_SCHEDULED_DATE_KEY);
    
    console.log(`✅ Cancelled ${ids.length} prayer notifications`);
  } catch (error) {
    console.error('❌ Error cancelling prayer notifications:', error);
  }
}

/**
 * Check if notifications need to be rescheduled
 */
export async function shouldRescheduleNotifications(currentDate: string): Promise<boolean> {
  const lastScheduledDate = await getLastScheduledDate();
  
  if (!lastScheduledDate) {
    console.log('📅 No previous schedule found, needs scheduling');
    return true;
  }
  
  if (lastScheduledDate !== currentDate) {
    console.log('📅 Date changed, needs rescheduling:', lastScheduledDate, '->', currentDate);
    return true;
  }
  
  // Check if any notifications are actually scheduled
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const prayerNotifications = scheduledNotifications.filter(
    n => n.content.data?.type === 'prayer'
  );
  
  if (prayerNotifications.length === 0) {
    console.log('📅 No prayer notifications found, needs scheduling');
    return true;
  }
  
  console.log('✅ Notifications already scheduled for today:', prayerNotifications.length);
  return false;
}

/**
 * Schedule notifications for all prayer times
 */
export async function schedulePrayerNotifications(
  prayerTimes: DailyPrayerTimes
): Promise<void> {
  try {
    console.log('🕌 ========== SCHEDULING PRAYER NOTIFICATIONS ==========');
    console.log('📅 Date:', prayerTimes.date);
    console.log('📍 Location:', prayerTimes.locationName || 'Unknown');
    
    // Check permission
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Notification permission not granted, cannot schedule');
      return;
    }
    
    // Check if we need to reschedule
    const needsReschedule = await shouldRescheduleNotifications(prayerTimes.date);
    if (!needsReschedule) {
      console.log('✅ Notifications already scheduled for today, skipping');
      return;
    }

    // Cancel existing notifications
    await cancelAllPrayerNotifications();

    const notificationIds: string[] = [];
    const now = new Date();
    let scheduledCount = 0;
    let skippedCount = 0;

    console.log('⏰ Current time:', now.toLocaleString());
    console.log('🕌 Scheduling notifications for 5 prayers...');

    // Schedule notification for each prayer
    for (const prayer of prayerTimes.prayers) {
      const prayerDate = new Date(prayer.date);
      const timeDiff = prayerDate.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeDiff / (1000 * 60));
      
      console.log(`\n📿 ${prayer.name} (${prayer.arabicName})`);
      console.log(`   Time: ${prayer.time}`);
      console.log(`   Date: ${prayerDate.toLocaleString()}`);
      console.log(`   Minutes until: ${minutesUntil}`);
      
      // Only schedule for future prayers (at least 1 minute in the future)
      if (timeDiff > 60000) { // More than 1 minute in the future
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
                prayerTime: prayer.time,
                prayerDate: prayerDate.toISOString(),
              },
            },
            trigger: {
              date: prayerDate,
              channelId: 'prayer',
            },
          });

          notificationIds.push(id);
          scheduledCount++;
          console.log(`   ✅ Scheduled notification ID: ${id}`);
        } catch (error) {
          console.error(`   ❌ Error scheduling notification for ${prayer.name}:`, error);
        }
      } else {
        skippedCount++;
        console.log(`   ⏭️ Skipped (already passed or too soon)`);
      }
    }

    // Save notification IDs and date
    await saveNotificationIds(notificationIds);
    await saveLastScheduledDate(prayerTimes.date);
    
    console.log('\n📊 SCHEDULING SUMMARY:');
    console.log(`   ✅ Scheduled: ${scheduledCount} notifications`);
    console.log(`   ⏭️ Skipped: ${skippedCount} notifications`);
    console.log(`   📝 Total IDs saved: ${notificationIds.length}`);
    console.log('========================================================\n');
    
    // Verify scheduled notifications
    await verifyScheduledNotifications();
  } catch (error) {
    console.error('❌ Error scheduling prayer notifications:', error);
    throw error;
  }
}

/**
 * Verify scheduled notifications
 */
async function verifyScheduledNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prayerNotifications = scheduled.filter(n => n.content.data?.type === 'prayer');
    
    console.log('🔍 VERIFICATION:');
    console.log(`   Total scheduled notifications: ${scheduled.length}`);
    console.log(`   Prayer notifications: ${prayerNotifications.length}`);
    
    if (prayerNotifications.length > 0) {
      console.log('   Prayer notification details:');
      prayerNotifications.forEach((n, index) => {
        const trigger = n.trigger as any;
        const triggerDate = trigger?.value ? new Date(trigger.value) : null;
        console.log(`   ${index + 1}. ${n.content.data?.prayerName} at ${triggerDate?.toLocaleString() || 'unknown'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying scheduled notifications:', error);
  }
}

/**
 * Get count of scheduled notifications
 */
export async function getScheduledNotificationCount(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prayerNotifications = scheduled.filter(n => n.content.data?.type === 'prayer');
    return prayerNotifications.length;
  } catch (error) {
    console.error('❌ Error getting scheduled notification count:', error);
    return 0;
  }
}

/**
 * Get all scheduled prayer notifications
 */
export async function getScheduledPrayerNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter(n => n.content.data?.type === 'prayer');
  } catch (error) {
    console.error('❌ Error getting scheduled prayer notifications:', error);
    return [];
  }
}

/**
 * Schedule a reminder notification before prayer time
 */
export async function scheduleReminderNotification(
  prayer: PrayerTime,
  minutesBefore: number = 15
): Promise<string | null> {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Cannot schedule reminder: no permission');
      return null;
    }

    const reminderDate = new Date(prayer.date);
    reminderDate.setMinutes(reminderDate.getMinutes() - minutesBefore);

    // Only schedule if reminder is in the future
    const now = new Date();
    if (reminderDate <= now) {
      console.log('⏭️ Reminder time already passed, skipping');
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${prayer.name} Prayer Soon`,
        body: `${prayer.name} prayer is in ${minutesBefore} minutes`,
        sound: 'default',
        data: {
          type: 'prayer_reminder',
          prayerName: prayer.name,
          minutesBefore,
        },
      },
      trigger: {
        date: reminderDate,
        channelId: 'prayer_reminder',
      },
    });

    console.log(`✅ Scheduled reminder for ${prayer.name} ${minutesBefore} minutes before (ID: ${id})`);
    return id;
  } catch (error) {
    console.error('❌ Error scheduling reminder notification:', error);
    return null;
  }
}

/**
 * Initialize notification system
 */
export async function initializeNotifications(): Promise<void> {
  try {
    console.log('🔔 Initializing notification system...');
    
    // Setup Android channels
    if (Platform.OS === 'android') {
      await setupAndroidNotificationChannels();
    }
    
    // Request permissions
    await requestNotificationPermission();
    
    console.log('✅ Notification system initialized');
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
  }
}
