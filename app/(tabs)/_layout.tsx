
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  // Define the tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: '(iman)',
      route: '/(tabs)/(iman)/',
      icon: 'favorite',
      label: 'Iman',
    },
    {
      name: '(learning)',
      route: '/(tabs)/(learning)/',
      icon: 'school',
      label: 'Learn',
    },
    {
      name: '(wellness)',
      route: '/(tabs)/(wellness)/',
      icon: 'spa',
      label: 'Wellness',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none', // Remove fade animation to prevent black screen flash
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="iman" name="(iman)" />
        <Stack.Screen key="learning" name="(learning)" />
        <Stack.Screen key="wellness" name="(wellness)" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
