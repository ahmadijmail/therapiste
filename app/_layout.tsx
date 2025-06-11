import '../global.css';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '~/src/stores/authStore';
import { useRoomsStore } from '~/src/stores/roomsStore';
import AuthWrapper from '~/src/components/AuthWrapper';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'auth',
};

export default function RootLayout() {
  const { initialize } = useAuthStore();
  const { fetchRooms } = useRoomsStore();

  useEffect(() => {
    // Initialize auth store when app starts
    const initializeApp = async () => {
      try {
        await initialize();
        // Fetch rooms data for the app
        await fetchRooms();
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, [initialize, fetchRooms]);

  return (
    <AuthWrapper>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthWrapper>
  );
}
