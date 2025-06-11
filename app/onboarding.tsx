import React from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '~/src/stores/authStore';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuthStore();

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Welcome to Therapiste',
          headerShown: false 
        }} 
      />
      <View className="flex-1 bg-white justify-center px-6">
        <Text className="text-3xl font-bold text-center mb-4 text-gray-900">
          Welcome to Therapiste! 🌟
        </Text>
        <Text className="text-gray-600 text-center mb-8 text-lg leading-6">
          Let&apos;s get you set up with a personalized therapy experience.
        </Text>
        
        <Text className="text-gray-500 text-center mb-8">
          Complete onboarding flow will be implemented here with:
          {'\n'}• Language selection (EN/AR)
          {'\n'}• Preference collection
          {'\n'}• Interactive animations
          {'\n'}• Personalized recommendations
        </Text>

        <TouchableOpacity 
          onPress={handleCompleteOnboarding}
          className="bg-blue-600 rounded-lg py-4 mx-4"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Skip Onboarding (Temporary)
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 