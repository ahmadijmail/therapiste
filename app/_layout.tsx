import '../global.css';

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/src/lib/queryClient';
import { useAuthStore } from '~/src/stores/authStore';
import { useRoomsStore } from '~/src/stores/roomsStore';
import AuthWrapper from '~/src/components/AuthWrapper';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'auth',
};

export default function RootLayout() {
  const { initialize, initialized } = useAuthStore();
  const { fetchRooms } = useRoomsStore();

  useEffect(() => {
    // Only initialize if not already initialized
    if (!initialized) {
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
    }
  }, [initialized, initialize, fetchRooms]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthWrapper>
    </QueryClientProvider>
  );
}
