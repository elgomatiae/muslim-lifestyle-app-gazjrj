
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  // Define all 5 tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      iosIcon: 'house.fill',
      label: 'Home',
    },
    {
      name: '(learning)',
      route: '/(tabs)/(learning)/',
      icon: 'school',
      iosIcon: 'book.fill',
      label: 'Learning',
    },
    {
      name: '(iman)',
      route: '/(tabs)/(iman)/',
      icon: 'favorite',
      iosIcon: 'heart.fill',
      label: 'Iman',
      isCenter: true,
    },
    {
      name: '(wellness)',
      route: '/(tabs)/(wellness)/',
      icon: 'spa',
      iosIcon: 'leaf.fill',
      label: 'Wellness',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      iosIcon: 'person.fill',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(iman)" />
        <Stack.Screen name="(learning)" />
        <Stack.Screen name="(wellness)" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
