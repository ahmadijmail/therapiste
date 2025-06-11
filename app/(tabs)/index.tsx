import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '~/src/stores/authStore';
import { useRoomsStore } from '~/src/stores/roomsStore';

export default function Home() {
  const { user } = useAuthStore();
  const { featuredRooms } = useRoomsStore();

  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView style={styles.container} className="bg-white">
        {/* Welcome Header */}
        <View className="px-6 py-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </Text>
          <Text className="text-gray-600">
            How are you feeling today? Let&apos;s continue your mental health journey.
          </Text>
        </View>

        {/* Trial Status */}
        {user?.subscription_status === 'trial' && (
          <View className="mx-6 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Text className="text-blue-800 font-semibold mb-1">
              🎉 Free Trial Active
            </Text>
            <Text className="text-blue-700 text-sm">
              You have access to all premium features. Make the most of your trial!
            </Text>
          </View>
        )}

        {/* Featured Rooms */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Featured Therapy Rooms
          </Text>
          
          {featuredRooms.length > 0 ? (
            <View className="space-y-3">
              {featuredRooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  onPress={() => console.log('Navigate to room:', room.slug)}
                >
                  <Text className="font-semibold text-gray-900 mb-1">
                    {room.name_en}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {room.description_en}
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-blue-600 text-sm font-medium">
                      {room.type === 'game' ? '🎮 Game' : 
                       room.type === 'conversation' ? '💬 Chat' : 
                       '📊 Analysis'}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {room.is_premium ? '👑 Premium' : '🆓 Free'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-gray-50 p-6 rounded-lg">
              <Text className="text-gray-500 text-center">
                Loading therapy rooms...
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          
          <View className="grid grid-cols-2 gap-3">
            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg">
              <Text className="text-white font-semibold text-center">
                🎯 Mood Check-in
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-green-600 p-4 rounded-lg">
              <Text className="text-white font-semibold text-center">
                💬 Start Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-20" />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
