
import React from 'react';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="house.fill" 
              android_material_icon_name="home"
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(prayer)"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="moon.stars.fill" 
              android_material_icon_name="nightlight"
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(iman)"
        options={{
          title: 'Iman',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending-up"
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(learning)"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="book.fill" 
              android_material_icon_name="menu-book"
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(wellness)"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="heart.fill" 
              android_material_icon_name="favorite"
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person"
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
