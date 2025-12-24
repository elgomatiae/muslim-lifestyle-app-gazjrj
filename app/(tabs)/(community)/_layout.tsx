
import React from 'react';
import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="community-detail" />
      <Stack.Screen name="invite-user" />
      <Stack.Screen name="invites-inbox" />
    </Stack>
  );
}
