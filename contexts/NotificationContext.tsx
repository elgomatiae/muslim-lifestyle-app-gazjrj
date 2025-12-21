
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  requestLocationPermissions,
  getNotificationSettings,
  updateNotificationSettings,
  initializeNotifications,
  sendAchievementNotification,
  sendImanTrackerMilestone,
  cancelAllNotifications,
  getScheduledNotifications,
  NotificationSettings,
} from '@/utils/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  settings: NotificationSettings;
  loading: boolean;
  requestPermissions: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  sendAchievement: (title: string, description: string) => Promise<void>;
  sendMilestone: (milestone: string, message: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
  scheduledCount: number;
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
  });
  const [loading, setLoading] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);

  const loadSettings = useCallback(async () => {
    try {
      console.log('NotificationContext: Loading settings...');
      const loadedSettings = await getNotificationSettings(user?.id);
      setSettings(loadedSettings);

      // Get scheduled notifications count
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);

      console.log('NotificationContext: Settings loaded', loadedSettings);
    } catch (error) {
      console.error('NotificationContext: Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requestPermissions = useCallback(async () => {
    console.log('NotificationContext: Requesting permissions...');
    setLoading(true);

    try {
      const notificationGranted = await requestNotificationPermissions();
      const locationGranted = await requestLocationPermissions();

      const newSettings = {
        ...settings,
        notificationPermissionGranted: notificationGranted,
        locationPermissionGranted: locationGranted,
      };

      await updateNotificationSettings(newSettings, user?.id);
      setSettings(newSettings);

      if (notificationGranted) {
        await initializeNotifications();
      }

      // Update scheduled count
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);

      console.log('NotificationContext: Permissions updated', newSettings);
    } catch (error) {
      console.error('NotificationContext: Error requesting permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    console.log('NotificationContext: Updating settings...', newSettings);
    setLoading(true);

    try {
      const updatedSettings = { ...settings, ...newSettings };
      await updateNotificationSettings(newSettings, user?.id);
      setSettings(updatedSettings);

      // Update scheduled count
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);

      console.log('NotificationContext: Settings updated');
    } catch (error) {
      console.error('NotificationContext: Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  }, [settings, user]);

  const sendAchievement = useCallback(async (title: string, description: string) => {
    await sendAchievementNotification(title, description);
  }, []);

  const sendMilestone = useCallback(async (milestone: string, message: string) => {
    await sendImanTrackerMilestone(milestone, message);
  }, []);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;

      // Handle notification tap based on type
      if (data.type === 'prayer') {
        console.log('Prayer notification tapped:', data.prayerName);
      } else if (data.type === 'daily_content') {
        console.log('Daily content notification tapped');
      } else if (data.type === 'iman_score') {
        console.log('Iman score notification tapped');
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const value: NotificationContextType = {
    settings,
    loading,
    requestPermissions,
    updateSettings,
    sendAchievement,
    sendMilestone,
    refreshSettings,
    scheduledCount,
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
