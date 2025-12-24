
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  requestNotificationPermission, 
  areNotificationsEnabled,
  schedulePrayerNotifications,
  cancelAllPrayerNotifications,
  getScheduledNotificationCount,
} from '@/utils/prayerNotificationService';
import { 
  requestLocationPermission, 
  checkLocationPermission,
  isLocationEnabled,
} from '@/utils/locationService';
import { getPrayerTimes, refreshPrayerTimes } from '@/utils/prayerTimeService';
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
      console.log('Error loading settings from Supabase:', error);
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

      console.log('Settings saved to Supabase');
    } catch (error) {
      console.log('Error saving settings to Supabase:', error);
    }
  }, [user]);

  // Load all settings
  const loadSettings = useCallback(async () => {
    try {
      console.log('Loading notification settings...');

      // Check permissions
      const notificationGranted = await areNotificationsEnabled();
      const locationGranted = await checkLocationPermission();
      const servicesEnabled = await isLocationEnabled();

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

      console.log('Settings loaded:', newSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSettingsFromSupabase]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    console.log('Requesting permissions...');
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

      // If both permissions granted, schedule prayer notifications
      if (notificationGranted && locationGranted && settings.prayerNotifications) {
        const prayers = await getPrayerTimes();
        await schedulePrayerNotifications(prayers);
        const count = await getScheduledNotificationCount();
        setScheduledCount(count);
      }

      console.log('Permissions updated:', newSettings);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    console.log('Updating settings:', newSettings);
    setLoading(true);

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Save to Supabase
      await saveSettingsToSupabase(newSettings);

      // If prayer notifications were toggled, update notifications
      if (newSettings.prayerNotifications !== undefined) {
        if (newSettings.prayerNotifications && settings.notificationPermissionGranted) {
          const prayers = await getPrayerTimes();
          await schedulePrayerNotifications(prayers);
        } else {
          await cancelAllPrayerNotifications();
        }
        const count = await getScheduledNotificationCount();
        setScheduledCount(count);
      }

      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  }, [settings, saveSettingsToSupabase]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Refresh prayer times and notifications
  const refreshPrayerTimesAndNotifications = useCallback(async () => {
    try {
      console.log('Refreshing prayer times and notifications...');
      
      const prayers = await refreshPrayerTimes();
      
      if (settings.prayerNotifications && settings.notificationPermissionGranted) {
        await schedulePrayerNotifications(prayers);
      }
      
      const count = await getScheduledNotificationCount();
      setScheduledCount(count);
      
      console.log('Prayer times and notifications refreshed');
    } catch (error) {
      console.error('Error refreshing prayer times:', error);
    }
  }, [settings.prayerNotifications, settings.notificationPermissionGranted]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Initialize prayer notifications when permissions are granted
  useEffect(() => {
    if (settings.notificationPermissionGranted && 
        settings.locationPermissionGranted && 
        settings.prayerNotifications) {
      getPrayerTimes().then(prayers => {
        schedulePrayerNotifications(prayers);
      });
    }
  }, [settings.notificationPermissionGranted, settings.locationPermissionGranted, settings.prayerNotifications]);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Refresh prayer times daily at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      console.log('Daily prayer time refresh');
      refreshPrayerTimesAndNotifications();
      
      // Set up daily interval
      const interval = setInterval(() => {
        refreshPrayerTimesAndNotifications();
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timeout);
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
