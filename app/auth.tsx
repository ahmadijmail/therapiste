import React from 'react';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import LoginForm from '~/src/features/auth/components/LoginForm';

export default function AuthScreen() {
  const handleAuthSuccess = () => {
    // Navigate to main app after successful authentication
      router.replace('/(protected)/(tabs)');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen (implement later)
    console.log('Navigate to forgot password');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Therapiste',
          headerShown: false 
        }} 
      />
      <View className="flex-1 bg-background">
        <LoginForm 
          onSuccess={handleAuthSuccess}
          onForgotPassword={handleForgotPassword}
        />
      </View>
    </>
  );
} 