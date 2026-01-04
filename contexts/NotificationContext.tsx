
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  notificationPermissionGranted: boolean;
  locationPermissionGranted: boolean;
  prayerNotifications: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  refreshPrayerTimesAndNotifications: () => Promise<void>;
  scheduledCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SETTINGS_KEY = '@notification_settings';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    notificationPermissionGranted: false,
    locationPermissionGranted: false,
    prayerNotifications: false,
  });
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      console.log('Initializing notification settings...');
      
      // Load saved settings
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        console.log('Loaded saved settings:', parsedSettings);
        setSettings(parsedSettings);
      }

      // Check notification permission
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === 'granted';
      console.log('Notification permission status:', status, 'granted:', granted);
      
      setSettings(prev => ({
        ...prev,
        notificationPermissionGranted: granted,
      }));

      // Get scheduled notification count
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
      console.log('Scheduled notifications count:', scheduled.length);
    } catch (error) {
      console.error('Failed to initialize notification settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      console.log('Updating settings with:', newSettings);
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const refreshPrayerTimesAndNotifications = async () => {
    try {
      console.log('Refreshing prayer times and notifications');
      // TODO: Backend Integration - Fetch updated prayer times from backend API
      // This will be implemented when prayer notification scheduling is integrated
      
      // Update scheduled count
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(scheduled.length);
      console.log('Refreshed scheduled notifications count:', scheduled.length);
    } catch (error) {
      console.error('Failed to refresh prayer notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        refreshPrayerTimesAndNotifications,
        scheduledCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
