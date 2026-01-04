
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayPrayerTimes } from '@/services/PrayerTimeService';
import { getCurrentLocation } from '@/services/LocationService';
import { schedulePrayerNotifications } from '@/services/PrayerNotificationService';

interface NotificationSettings {
  notificationPermissionGranted: boolean;
  locationPermissionGranted: boolean;
  prayerNotifications: boolean;
  dhikrReminders: boolean;
  quranReminders: boolean;
  dailyContentNotifications: boolean;
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  requestPermissions: () => Promise<boolean>;
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  refreshPrayerTimesAndNotifications: () => Promise<void>;
  scheduledCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SETTINGS_KEY = '@notification_settings';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    notificationPermissionGranted: false,
    locationPermissionGranted: false,
    prayerNotifications: true,
    dhikrReminders: false,
    quranReminders: false,
    dailyContentNotifications: true,
  });

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      // Check notification permissions
      const { status: notifStatus } = await Notifications.getPermissionsAsync();
      const notifGranted = notifStatus === 'granted';
      
      // Check location permissions
      const { status: locStatus } = await Location.getForegroundPermissionsAsync();
      const locGranted = locStatus === 'granted';
      
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      const newSettings: NotificationSettings = {
        notificationPermissionGranted: notifGranted,
        locationPermissionGranted: locGranted,
        prayerNotifications: parsedSettings.prayerNotifications ?? true,
        dhikrReminders: parsedSettings.dhikrReminders ?? false,
        quranReminders: parsedSettings.quranReminders ?? false,
        dailyContentNotifications: parsedSettings.dailyContentNotifications ?? true,
      };
      
      setSettings(newSettings);
      setNotificationsEnabled(notifGranted);
      
      // Get scheduled notification count
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
      
      console.log('📱 NotificationContext initialized:', newSettings);
    } catch (error) {
      console.error('Error initializing notification settings:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Request notification permissions
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      const notifGranted = notifStatus === 'granted';
      
      // Request location permissions
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      const locGranted = locStatus === 'granted';
      
      const newSettings = {
        ...settings,
        notificationPermissionGranted: notifGranted,
        locationPermissionGranted: locGranted,
      };
      
      setSettings(newSettings);
      setNotificationsEnabled(notifGranted);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      console.log('✅ Permissions granted:', { notifGranted, locGranted });
      
      return notifGranted && locGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      
      console.log('💾 Settings updated:', updatedSettings);
      
      // If prayer notifications were enabled, refresh them
      if (newSettings.prayerNotifications && updatedSettings.notificationPermissionGranted && updatedSettings.locationPermissionGranted) {
        await refreshPrayerTimesAndNotifications();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const refreshPrayerTimesAndNotifications = async () => {
    try {
      if (!settings.notificationPermissionGranted || !settings.locationPermissionGranted) {
        console.log('⚠️ Cannot refresh notifications: permissions not granted');
        return;
      }
      
      if (!settings.prayerNotifications) {
        console.log('⚠️ Prayer notifications are disabled');
        return;
      }
      
      console.log('🔄 Refreshing prayer times and notifications...');
      
      // Get current location
      const location = await getCurrentLocation(true);
      
      // Get today's prayer times
      const prayerTimes = await getTodayPrayerTimes(location, undefined, 'NorthAmerica', true);
      
      // Schedule notifications
      await schedulePrayerNotifications(prayerTimes);
      
      // Update scheduled count
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
      
      console.log('✅ Prayer notifications refreshed:', scheduled.length, 'scheduled');
    } catch (error) {
      console.error('Error refreshing prayer notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notificationsEnabled, 
        setNotificationsEnabled, 
        requestPermissions,
        settings,
        updateSettings,
        refreshPrayerTimesAndNotifications,
        scheduledCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
