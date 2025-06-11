import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, initialized, loading } = useAuthStore();
  
  const segments = useSegments();

  console.log('AuthWrapper state:', { initialized, loading, hasUser: !!user });

  useEffect(() => {
    if (!initialized || loading ) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user) {
      // User is not authenticated
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else if (!user.onboarding_completed) {
      // User is authenticated but hasn't completed onboarding
      if (!inOnboardingGroup) {
        router.replace('/onboarding');
      }
    } else {
      // User is authenticated and onboarding is complete
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, initialized, loading, segments]);

  
  // Show loading screen while initializing
  if (!initialized || loading ) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading Therapiste...</Text>
      </View>
    );
  }

  return <>{children}</>;
} 