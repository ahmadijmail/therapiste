import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '~/src/stores/authStore';

export default function ProtectedLayout() {
  const { user, initialized, loading } = useAuthStore();

  // Show loading screen while initializing
  if (!initialized || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    return <Redirect href="/auth" />;
  }

  // User exists, render the stack layout
  return (
    <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
