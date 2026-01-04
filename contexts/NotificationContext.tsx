
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  requestNotificationPermission, 
  hasNotificationPermission as areNotificationsEnabled,
  schedulePrayerNotifications,
  cancelAllPrayerNotifications,
  getScheduledNotificationCount,
  initializeNotifications,
  shouldRescheduleNotifications,
} from '@/services/PrayerNotificationService';
import { 
  requestLocationPermission, 
  hasLocationPermission as checkLocationPermission,
  getCurrentLocation,
} from '@/services/LocationService';
import { getTodayPrayerTimes, refreshPrayerTimes } from '@/services/PrayerTimeService';
import { useAuth } from './AuthContext';
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
  locationServicesEnabled: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  loading: boolean;
  requestPermissions: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  scheduledCount: number;
  refreshPrayerTimesAndNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function to check if location services are enabled
async function isLocationEnabled(): Promise<boolean> {
  try {
    const hasPermission = await checkLocationPermission();
    return hasPermission;
  } catch (error) {
    console.error('❌ Error checking location services:', error);
    return false;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    prayerNotifications: true,
    dailyContentNotifications: true,
    imanScoreNotifications: true,
    imanTrackerNotifications: true,
    goalReminderNotifications: true,
    achievementNotifications: true,
    locationPermissionGranted: false,
    notificationPermissionGranted: false,
    locationServicesEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Initialize notifications on mount
  useEffect(() => {
    console.log('🔔 NotificationContext: Initializing...');
    initializeNotifications();
  }, []);

  // Load settings from Supabase
  const loadSettingsFromSupabase = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        prayerNotifications: data.prayer_notifications ?? true,
        dailyContentNotifications: data.daily_content_notifications ?? true,
        imanScoreNotifications: data.iman_score_notifications ?? true,
        imanTrackerNotifications: data.iman_tracker_notifications ?? true,
        goalReminderNotifications: data.goal_reminder_notifications ?? true,
        achievementNotifications: data.achievement_notifications ?? true,
      };
    } catch (error) {
      console.log('⚠️ Error loading settings from Supabase:', error);
      return null;
    }
  }, [user]);

  // Save settings to Supabase
  const saveSettingsToSupabase = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const dbSettings: any = {};
      if (newSettings.prayerNotifications !== undefined) {
        dbSettings.prayer_notifications = newSettings.prayerNotifications;
      }
      if (newSettings.dailyContentNotifications !== undefined) {
        dbSettings.daily_content_notifications = newSettings.dailyContentNotifications;
      }
      if (newSettings.imanScoreNotifications !== undefined) {
        dbSettings.iman_score_notifications = newSettings.imanScoreNotifications;
      }
      if (newSettings.imanTrackerNotifications !== undefined) {
        dbSettings.iman_tracker_notifications = newSettings.imanTrackerNotifications;
      }
      if (newSettings.goalReminderNotifications !== undefined) {
        dbSettings.goal_reminder_notifications = newSettings.goalReminderNotifications;
      }
      if (newSettings.achievementNotifications !== undefined) {
        dbSettings.achievement_notifications = newSettings.achievementNotifications;
      }

      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...dbSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      console.log('✅ Settings saved to Supabase');
    } catch (error) {
      console.log('⚠️ Error saving settings to Supabase:', error);
    }
  }, [user]);

  // Load all settings
  const loadSettings = useCallback(async () => {
    try {
      console.log('📥 Loading notification settings...');

      // Check permissions
      const notificationGranted = await areNotificationsEnabled();
      const locationGranted = await checkLocationPermission();
      const servicesEnabled = await isLocationEnabled();

      console.log('📱 Permissions:', {
        notifications: notificationGranted,
        location: locationGranted,
        services: servicesEnabled,
      });

      // Load user preferences from Supabase
      const userPrefs = await loadSettingsFromSupabase();

      const newSettings: NotificationSettings = {
        prayerNotifications: userPrefs?.prayerNotifications ?? true,
        dailyContentNotifications: userPrefs?.dailyContentNotifications ?? true,
        imanScoreNotifications: userPrefs?.imanScoreNotifications ?? true,
        imanTrackerNotifications: userPrefs?.imanTrackerNotifications ?? true,
        goalReminderNotifications: userPrefs?.goalReminderNotifications ?? true,
        achievementNotifications: userPrefs?.achievementNotifications ?? true,
        notificationPermissionGranted: notificationGranted,
        locationPermissionGranted: locationGranted,
        locationServicesEnabled: servicesEnabled,
      };

      setSettings(newSettings);

      // Get scheduled notification count
      const count = await getScheduledNotificationCount();
      setScheduledCount(count);

      console.log('✅ Settings loaded:', newSettings);
      console.log('📊 Scheduled notifications:', count);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSettingsFromSupabase]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    console.log('🔐 Requesting permissions...');
    setLoading(true);

    try {
      const notificationGranted = await requestNotificationPermission();
      const locationGranted = await requestLocationPermission();
      const servicesEnabled = await isLocationEnabled();

      const newSettings = {
        ...settings,
        notificationPermissionGranted: notificationGranted,
        locationPermissionGranted: locationGranted,
        locationServicesEnabled: servicesEnabled,
      };

      setSettings(newSettings);

      console.log('✅ Permissions updated:', {
        notifications: notificationGranted,
        location: locationGranted,
      });

      // If both permissions granted and prayer notifications enabled, schedule them
      if (notificationGranted && locationGranted && settings.prayerNotifications) {
        console.log('🕌 Scheduling prayer notifications...');
        const location = await getCurrentLocation(true);
        const prayers = await getTodayPrayerTimes(location, user?.id);
        await schedulePrayerNotifications(prayers);
        const count = await getScheduledNotificationCount();
        setScheduledCount(count);
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [settings, user]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    console.log('⚙️ Updating settings:', newSettings);
    setLoading(true);

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Save to Supabase
      await saveSettingsToSupabase(newSettings);

      // If prayer notifications were toggled, update notifications
      if (newSettings.prayerNotifications !== undefined) {
        if (newSettings.prayerNotifications && settings.notificationPermissionGranted && settings.locationPermissionGranted) {
          console.log('🕌 Enabling prayer notifications...');
          const location = await getCurrentLocation(true);
          const prayers = await getTodayPrayerTimes(location, user?.id);
          await schedulePrayerNotifications(prayers);
        } else if (newSettings.prayerNotifications === false) {
          console.log('🔕 Disabling prayer notifications...');
          await cancelAllPrayerNotifications();
        }
        const count = await getScheduledNotificationCount();
        setScheduledCount(count);
      }

      console.log('✅ Settings updated successfully');
    } catch (error) {
      console.error('❌ Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettingsToSupabase, user]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Refresh prayer times and notifications
  const refreshPrayerTimesAndNotifications = useCallback(async () => {
    try {
      console.log('🔄 Refreshing prayer times and notifications...');
      
      // Refresh prayer times
      await refreshPrayerTimes();
      
      // Reschedule notifications if enabled
      if (settings.prayerNotifications && settings.notificationPermissionGranted && settings.locationPermissionGranted) {
        const location = await getCurrentLocation(true);
        const prayers = await getTodayPrayerTimes(location, user?.id, 'NorthAmerica', false);
        await schedulePrayerNotifications(prayers);
      }
      
      // Update count
      const count = await getScheduledNotificationCount();
      setScheduledCount(count);
      
      console.log('✅ Prayer times and notifications refreshed');
    } catch (error) {
      console.error('❌ Error refreshing prayer times:', error);
    }
  }, [settings.prayerNotifications, settings.notificationPermissionGranted, settings.locationPermissionGranted, user]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Initialize prayer notifications when permissions are granted
  useEffect(() => {
    const initializePrayerNotifications = async () => {
      if (settings.notificationPermissionGranted && 
          settings.locationPermissionGranted && 
          settings.prayerNotifications) {
        try {
          console.log('🕌 Initializing prayer notifications...');
          const location = await getCurrentLocation(true);
          const prayers = await getTodayPrayerTimes(location, user?.id);
          
          // Check if we need to schedule
          const needsSchedule = await shouldRescheduleNotifications(prayers.date);
          if (needsSchedule) {
            await schedulePrayerNotifications(prayers);
            const count = await getScheduledNotificationCount();
            setScheduledCount(count);
          }
        } catch (error) {
          console.error('❌ Error initializing prayer notifications:', error);
        }
      }
    };

    initializePrayerNotifications();
  }, [settings.notificationPermissionGranted, settings.locationPermissionGranted, settings.prayerNotifications, user]);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification.request.content.title);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response.notification.request.content.title);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Refresh prayer times daily at midnight
  useEffect(() => {
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      
      console.log(`⏰ Scheduling midnight refresh in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
      
      const timeout = setTimeout(() => {
        console.log('🌙 Midnight refresh triggered');
        refreshPrayerTimesAndNotifications();
        
        // Set up daily interval
        const interval = setInterval(() => {
          console.log('🌙 Daily refresh triggered');
          refreshPrayerTimesAndNotifications();
        }, 24 * 60 * 60 * 1000);

        return () => clearInterval(interval);
      }, timeUntilMidnight);

      return () => clearTimeout(timeout);
    };

    const cleanup = scheduleMidnightRefresh();
    return cleanup;
  }, [refreshPrayerTimesAndNotifications]);

  const value: NotificationContextType = {
    settings,
    loading,
    requestPermissions,
    updateSettings,
    refreshSettings,
    scheduledCount,
    refreshPrayerTimesAndNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
