
import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9333EA', // Purple accent
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(learning)"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="book.fill"
              android_material_icon_name="menu-book"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(iman)"
        options={{
          title: 'Iman',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="heart.fill"
              android_material_icon_name="favorite"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(wellness)"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="spa"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
