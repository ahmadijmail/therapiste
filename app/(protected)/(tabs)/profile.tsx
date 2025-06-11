import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { useUser, useSubscription, useSignOut, useRemainingTrialDays } from '~/src/hooks/useAuth';
import { useRooms } from '~/src/hooks/useRooms';

// shadcn/ui components
import { Text } from '~/src/components/ui/text';
import { Button } from '~/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/src/components/ui/card';
import { Badge } from '~/src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '~/src/components/ui/avatar';
import { Progress } from '~/src/components/ui/progress';

export default function ProfileScreen() {
  const { data: user } = useUser();
  const { data: subscription } = useSubscription();
  const { data: rooms = [] } = useRooms();
  const remainingTrialDays = useRemainingTrialDays();
  const signOutMutation = useSignOut();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOutMutation.mutateAsync();
            } catch (error: any) {
              console.error('Sign out error:', error);
              Alert.alert(
                'Error',
                error?.message || 'Failed to sign out. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getSubscriptionBadge = () => {
    switch (subscription?.status) {
      case 'trial':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 border-0">
            <Text className="text-white font-bold">🆓 Free Trial</Text>
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0">
            <Text className="text-white font-bold">👑 Premium</Text>
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-red-600 border-0">
            <Text className="text-white font-bold">⏰ Expired</Text>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-300">
            <Text className="text-gray-600">✨ Free</Text>
          </Badge>
        );
    }
  };

  const getProgressPercentage = () => {
    if (subscription?.status === 'trial') {
      const totalDays = 3;
      const remaining = remainingTrialDays;
      return ((totalDays - remaining) / totalDays) * 100;
    }
    return 0;
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showChevron = true }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
      style={{ marginBottom: 8 }}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{title}</Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {showChevron && (
        <Text className="text-gray-400 text-lg">›</Text>
      )}
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color }: any) => (
    <View className={`flex-1 p-4 rounded-xl ${color} mx-1`}>
      <View className="items-center">
        <Text className="text-2xl mb-1">{icon}</Text>
        <Text className="text-2xl font-bold text-gray-800">{value}</Text>
        <Text className="text-xs text-gray-600 text-center">{label}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Profile',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTitleStyle: {
            color: 'white',
            fontWeight: 'bold',
          },
        }} 
      />
      
      <ScrollView className="flex-1 bg-gray-50">
        {/* Hero Header */}
        <View 
          className="bg-gradient-to-br from-blue-600 to-purple-700"
          style={{
           
            paddingTop: 100,
            paddingBottom: 30,
            paddingHorizontal: 24,
            backgroundColor: '#667eea',
          }}
        >
          <View className="items-center">
            {/* Profile Avatar */}
            <View className="relative mb-4">
              <Avatar alt="Profile Picture" className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage source={{ uri: user?.avatar_url }} />
                <AvatarFallback className="bg-white">
                  <Text className="text-primary font-bold text-2xl">
                    {getInitials(user?.full_name || 'User')}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="absolute -bottom-2 -right-2">
                <TouchableOpacity className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-md">
                  <Text className="text-sm">✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* User Info */}
            <Text className="text-2xl font-bold text-white mb-1">
              {user?.full_name || 'Welcome!'}
            </Text>
            
            <Text className="text-white/80 mb-3 text-base">
              {user?.email}
            </Text>
            
            {/* Subscription Badge */}
            {getSubscriptionBadge()}
          </View>
        </View>

        <View className="px-6 -mt-4 space-y-6 pb-8">
          {/* Trial Progress Card */}
          {subscription?.status === 'trial' && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
              <CardHeader className="pb-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <CardTitle className="text-lg text-blue-900">
                      🎯 Trial Progress
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      {remainingTrialDays} days remaining
                    </CardDescription>
                  </View>
                  <Text className="text-3xl">🚀</Text>
                </View>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={getProgressPercentage()} 
                  className="mb-4 h-2" 
                />
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                  onPress={() => console.log('Upgrade to premium')}
                >
                  <Text className="text-white font-bold">
                    ⭐ Upgrade to Premium
                  </Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📊 Your Journey</CardTitle>
              <CardDescription>Track your mental health progress</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="flex-row">
                <StatCard
                  icon="🎯"
                  value="12"
                  label="Sessions Completed"
                  color="bg-blue-50"
                />
                <StatCard
                  icon="🔥"
                  value="7"
                  label="Day Streak"
                  color="bg-orange-50"
                />
              </View>
              <View className="flex-row mt-3">
                <StatCard
                  icon="🏠"
                  value={rooms.length}
                  label="Rooms Unlocked"
                  color="bg-green-50"
                />
                <StatCard
                  icon="😊"
                  value="4.8"
                  label="Mood Average"
                  color="bg-purple-50"
                />
              </View>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">🏆 Recent Achievements</CardTitle>
              <CardDescription>Your latest milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <View className="flex-row items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">🌟</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">First Session</Text>
                    <Text className="text-sm text-gray-600">Started your mental health journey</Text>
                  </View>
                  <Badge className="bg-yellow-500 border-0">
                    <Text className="text-white text-xs font-bold">NEW</Text>
                  </Badge>
                </View>

                <View className="flex-row items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">🔥</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">Week Warrior</Text>
                    <Text className="text-sm text-gray-600">7 days of consistent practice</Text>
                  </View>
                  <Badge className="bg-blue-500 border-0">
                    <Text className="text-white text-xs font-bold">EARNED</Text>
                  </Badge>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Settings Menu */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">⚙️ Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-2">
                <SettingItem
                  icon="👤"
                  title="Edit Profile"
                  subtitle="Update your personal information"
                  onPress={() => console.log('Edit profile')}
                />
                
                <SettingItem
                  icon="🔔"
                  title="Notifications"
                  subtitle="Manage your notification preferences"
                  onPress={() => console.log('Notifications')}
                />
                
                <SettingItem
                  icon="🌐"
                  title="Language"
                  subtitle="English"
                  onPress={() => console.log('Language')}
                />
                
                <SettingItem
                  icon="🔒"
                  title="Privacy & Security"
                  subtitle="Control your data and privacy"
                  onPress={() => console.log('Privacy')}
                />
                
                <SettingItem
                  icon="❓"
                  title="Help & Support"
                  subtitle="Get help and contact support"
                  onPress={() => console.log('Help')}
                />
              </View>
            </CardContent>
          </Card>

          {/* Sign Out Button */}
          <Card className="bg-white shadow-sm border-red-100">
            <CardContent className="pt-6">
              <Button 
                variant="destructive"
                onPress={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Text className="text-white font-bold">
                  {isSigningOut ? '⏳ Signing Out...' : '🚪 Sign Out'}
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}