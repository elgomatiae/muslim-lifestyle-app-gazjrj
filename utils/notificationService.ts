
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  prayerNotifications: boolean;
  dailyContentNotifications: boolean;
  imanScoreNotifications: boolean;
  imanTrackerNotifications: boolean;
  goalReminderNotifications: boolean;
  achievementNotifications: boolean;
  locationPermissionGranted: boolean;
  notificationPermissionGranted: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  prayerNotifications: true,
  dailyContentNotifications: true,
  imanScoreNotifications: true,
  imanTrackerNotifications: true,
  goalReminderNotifications: true,
  achievementNotifications: true,
  locationPermissionGranted: false,
  notificationPermissionGranted: false,
};

const SETTINGS_KEY = '@notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@scheduled_notifications';

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  console.log('Requesting notification permissions...');
  
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return false;
  }

  try {
    // For Android, create notification channel first
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });

      await Notifications.setNotificationChannelAsync('prayers', {
        name: 'Prayer Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('daily_content', {
        name: 'Daily Content',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9800',
      });

      await Notifications.setNotificationChannelAsync('iman_tracker', {
        name: 'Iman Tracker',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    console.log('Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Request location permissions
export async function requestLocationPermissions(): Promise<boolean> {
  console.log('Requesting location permissions...');

  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Location permission denied');
      return false;
    }

    console.log('Location permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

// Get notification settings
export async function getNotificationSettings(userId?: string): Promise<NotificationSettings> {
  try {
    // Try to load from Supabase if user ID is provided
    if (userId) {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const settings: NotificationSettings = {
          prayerNotifications: data.prayer_notifications,
          dailyContentNotifications: data.daily_content_notifications,
          imanScoreNotifications: data.iman_score_notifications,
          imanTrackerNotifications: data.iman_tracker_notifications,
          goalReminderNotifications: data.goal_reminder_notifications,
          achievementNotifications: data.achievement_notifications,
          locationPermissionGranted: data.location_permission_granted,
          notificationPermissionGranted: data.notification_permission_granted,
        };
        
        // Also save to AsyncStorage for offline access
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return settings;
      }
    }

    // Fallback to AsyncStorage
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save notification settings
export async function saveNotificationSettings(settings: NotificationSettings, userId?: string): Promise<void> {
  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // Save to Supabase if user ID is provided
    if (userId) {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          prayer_notifications: settings.prayerNotifications,
          daily_content_notifications: settings.dailyContentNotifications,
          iman_score_notifications: settings.imanScoreNotifications,
          iman_tracker_notifications: settings.imanTrackerNotifications,
          goal_reminder_notifications: settings.goalReminderNotifications,
          achievement_notifications: settings.achievementNotifications,
          location_permission_granted: settings.locationPermissionGranted,
          notification_permission_granted: settings.notificationPermissionGranted,
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
      }
    }
    
    console.log('Notification settings saved');
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Schedule prayer notifications
export async function schedulePrayerNotifications(): Promise<void> {
  console.log('Scheduling prayer notifications...');

  const settings = await getNotificationSettings();
  if (!settings.prayerNotifications) {
    console.log('Prayer notifications disabled');
    return;
  }

  // Cancel existing prayer notifications
  await cancelNotificationsByType('prayer');

  const prayers = [
    { name: 'Fajr', hour: 5, minute: 30 },
    { name: 'Dhuhr', hour: 12, minute: 45 },
    { name: 'Asr', hour: 16, minute: 15 },
    { name: 'Maghrib', hour: 18, minute: 30 },
    { name: 'Isha', hour: 20, minute: 0 },
  ];

  for (const prayer of prayers) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer.name} Prayer Time 🕌`,
        body: `It's time for ${prayer.name} prayer. May Allah accept your worship.`,
        data: { type: 'prayer', prayerName: prayer.name },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prayer.hour,
        minute: prayer.minute,
        repeats: true,
        channelId: 'prayers',
      },
    });

    await saveScheduledNotification(notificationId, 'prayer', prayer.name);
    console.log(`Scheduled ${prayer.name} notification: ${notificationId}`);
  }
}

// Schedule daily content notification
export async function scheduleDailyContentNotification(): Promise<void> {
  console.log('Scheduling daily content notification...');

  const settings = await getNotificationSettings();
  if (!settings.dailyContentNotifications) {
    console.log('Daily content notifications disabled');
    return;
  }

  // Cancel existing daily content notifications
  await cancelNotificationsByType('daily_content');

  // Schedule for 8 AM daily
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Verse & Hadith 📖',
      body: 'Your daily Quran verse and Hadith are ready. Start your day with wisdom!',
      data: { type: 'daily_content' },
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
      repeats: true,
      channelId: 'daily_content',
    },
  });

  await saveScheduledNotification(notificationId, 'daily_content', 'Daily Content');
  console.log(`Scheduled daily content notification: ${notificationId}`);
}

// Schedule Iman score notification
export async function scheduleImanScoreNotification(): Promise<void> {
  console.log('Scheduling Iman score notification...');

  const settings = await getNotificationSettings();
  if (!settings.imanScoreNotifications) {
    console.log('Iman score notifications disabled');
    return;
  }

  // Cancel existing Iman score notifications
  await cancelNotificationsByType('iman_score');

  // Schedule for 9 PM daily
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Iman Score 📊',
      body: 'Check your Iman score for today and see your progress!',
      data: { type: 'iman_score' },
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
      repeats: true,
      channelId: 'iman_tracker',
    },
  });

  await saveScheduledNotification(notificationId, 'iman_score', 'Iman Score');
  console.log(`Scheduled Iman score notification: ${notificationId}`);
}

// Schedule goal reminder notifications
export async function scheduleGoalReminderNotifications(): Promise<void> {
  console.log('Scheduling goal reminder notifications...');

  const settings = await getNotificationSettings();
  if (!settings.goalReminderNotifications) {
    console.log('Goal reminder notifications disabled');
    return;
  }

  // Cancel existing goal reminder notifications
  await cancelNotificationsByType('goal_reminder');

  // Morning reminder at 10 AM
  const morningId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Morning Goals Reminder 🎯',
      body: 'Don\'t forget to work on your daily goals today!',
      data: { type: 'goal_reminder', time: 'morning' },
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 10,
      minute: 0,
      repeats: true,
      channelId: 'iman_tracker',
    },
  });

  await saveScheduledNotification(morningId, 'goal_reminder', 'Morning Reminder');

  // Evening reminder at 7 PM
  const eveningId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Goals Check 🌙',
      body: 'How are your goals coming along? Check your progress!',
      data: { type: 'goal_reminder', time: 'evening' },
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
      repeats: true,
      channelId: 'iman_tracker',
    },
  });

  await saveScheduledNotification(eveningId, 'goal_reminder', 'Evening Reminder');
  console.log('Scheduled goal reminder notifications');
}

// Send immediate notification
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    console.log('Sent immediate notification:', title);
  } catch (error) {
    console.error('Error sending immediate notification:', error);
  }
}

// Send achievement notification
export async function sendAchievementNotification(
  achievementTitle: string,
  achievementDescription: string
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.achievementNotifications) {
    return;
  }

  await sendImmediateNotification(
    `🏆 Achievement Unlocked!`,
    `${achievementTitle}: ${achievementDescription}`,
    { type: 'achievement', title: achievementTitle }
  );
}

// Send Iman tracker milestone notification
export async function sendImanTrackerMilestone(
  milestone: string,
  message: string
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.imanTrackerNotifications) {
    return;
  }

  await sendImmediateNotification(
    `🌟 ${milestone}`,
    message,
    { type: 'iman_milestone', milestone }
  );
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  console.log('Cancelling all notifications...');
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
  console.log('All notifications cancelled');
}

// Cancel notifications by type
async function cancelNotificationsByType(type: string): Promise<void> {
  try {
    const scheduledJson = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (!scheduledJson) return;

    const scheduled = JSON.parse(scheduledJson);
    const toCancel = scheduled.filter((n: any) => n.type === type);

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.id);
    }

    const remaining = scheduled.filter((n: any) => n.type !== type);
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(remaining));

    console.log(`Cancelled ${toCancel.length} notifications of type: ${type}`);
  } catch (error) {
    console.error('Error cancelling notifications by type:', error);
  }
}

// Save scheduled notification info
async function saveScheduledNotification(
  id: string,
  type: string,
  name: string
): Promise<void> {
  try {
    const scheduledJson = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const scheduled = scheduledJson ? JSON.parse(scheduledJson) : [];

    scheduled.push({ id, type, name, scheduledAt: new Date().toISOString() });

    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error('Error saving scheduled notification:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Initialize all notifications
export async function initializeNotifications(): Promise<void> {
  console.log('Initializing notifications...');

  const settings = await getNotificationSettings();

  if (settings.notificationPermissionGranted) {
    await schedulePrayerNotifications();
    await scheduleDailyContentNotification();
    await scheduleImanScoreNotification();
    await scheduleGoalReminderNotifications();
  }

  console.log('Notifications initialized');
}

// Update notification settings and reschedule
export async function updateNotificationSettings(
  newSettings: Partial<NotificationSettings>,
  userId?: string
): Promise<void> {
  const currentSettings = await getNotificationSettings(userId);
  const updatedSettings = { ...currentSettings, ...newSettings };

  await saveNotificationSettings(updatedSettings, userId);

  // Reschedule notifications based on new settings
  if (updatedSettings.notificationPermissionGranted) {
    await initializeNotifications();
  } else {
    await cancelAllNotifications();
  }
}
