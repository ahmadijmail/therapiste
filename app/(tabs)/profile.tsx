import React from 'react';
import { Stack, router } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
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

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
        return <Badge className="bg-blue-100 text-blue-800">🎉 Free Trial</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">👑 Premium</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-100 text-red-800">⏰ Expired</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
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

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView className="flex-1 bg-background">
        {/* Header Section */}
        <View className="px-6 py-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <View className="items-center">
            <Avatar alt="Profile Picture" className="w-24 h-24 mb-4">
              <AvatarImage source={{ uri: user?.avatar_url }} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <Text className="text-primary-foreground font-bold">
                  {getInitials(user?.full_name || 'User')}
                </Text>
              </AvatarFallback>
            </Avatar>
            
            <Text className="text-2xl font-bold text-foreground mb-2">
              {user?.full_name || 'Welcome!'}
            </Text>
            
            <Text className="text-muted-foreground mb-3">
              {user?.email}
            </Text>
            
            {getSubscriptionBadge()}
          </View>
        </View>

        <View className="px-6 space-y-6">
          {/* Trial Progress (if on trial) */}
          {subscription?.status === 'trial' && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex-row items-center">
                  <Text className="text-blue-800">🎯 Trial Progress</Text>
                </CardTitle>
                <CardDescription>
                  {remainingTrialDays} days remaining in your free trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={getProgressPercentage()} className="mb-3" />
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300"
                  onPress={() => console.log('Upgrade to premium')}
                >
                  <Text className="text-blue-700 font-semibold">
                    ⭐ Upgrade to Premium
                  </Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Your Journey</CardTitle>
              <CardDescription>Track your mental health progress</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="grid grid-cols-2 gap-4">
                <View className="items-center p-4 bg-primary/5 rounded-lg">
                  <Text className="text-2xl font-bold text-primary">12</Text>
                  <Text className="text-sm text-muted-foreground">Sessions</Text>
                </View>
                <View className="items-center p-4 bg-green-500/10 rounded-lg">
                  <Text className="text-2xl font-bold text-green-600">7</Text>
                  <Text className="text-sm text-muted-foreground">Day Streak</Text>
                </View>
                <View className="items-center p-4 bg-orange-500/10 rounded-lg">
                  <Text className="text-2xl font-bold text-orange-600">{rooms.length}</Text>
                  <Text className="text-sm text-muted-foreground">Rooms Unlocked</Text>
                </View>
                <View className="items-center p-4 bg-purple-500/10 rounded-lg">
                  <Text className="text-2xl font-bold text-purple-600">4.8</Text>
                  <Text className="text-sm text-muted-foreground">Mood Average</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 Achievements</CardTitle>
              <CardDescription>Celebrate your milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <View className="flex-row items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-2xl">🌟</Text>
                    <View>
                      <Text className="font-semibold">First Session</Text>
                      <Text className="text-sm text-muted-foreground">Completed your first therapy session</Text>
                    </View>
                  </View>
                  <Badge className="bg-yellow-100 text-yellow-800">Earned</Badge>
                </View>

                <View className="flex-row items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-2xl">🔥</Text>
                    <View>
                      <Text className="font-semibold">Week Warrior</Text>
                      <Text className="text-sm text-muted-foreground">7 days of consistent practice</Text>
                    </View>
                  </View>
                  <Badge className="bg-blue-100 text-blue-800">Earned</Badge>
                </View>

                <View className="flex-row items-center justify-between p-3 bg-gray-100 rounded-lg opacity-60">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-2xl">👑</Text>
                    <View>
                      <Text className="font-semibold">Premium Explorer</Text>
                      <Text className="text-sm text-muted-foreground">Try all premium features</Text>
                    </View>
                  </View>
                  <Badge variant="outline">3/5</Badge>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-xl">👤</Text>
                    <Text className="font-medium">Edit Profile</Text>
                  </View>
                  <Text className="text-muted-foreground">›</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-xl">🔔</Text>
                    <Text className="font-medium">Notifications</Text>
                  </View>
                  <Text className="text-muted-foreground">›</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-xl">🌐</Text>
                    <Text className="font-medium">Language</Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-muted-foreground">English</Text>
                    <Text className="text-muted-foreground">›</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-xl">🔒</Text>
                    <Text className="font-medium">Privacy & Security</Text>
                  </View>
                  <Text className="text-muted-foreground">›</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-between p-3 border border-border rounded-lg">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-xl">❓</Text>
                    <Text className="font-medium">Help & Support</Text>
                  </View>
                  <Text className="text-muted-foreground">›</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <Button 
                variant="destructive"
                onPress={handleSignOut}
                className="w-full"
              >
                <Text className="text-destructive-foreground font-semibold">
                  🚪 Sign Out
                </Text>
              </Button>
            </CardContent>
          </Card>

          {/* Bottom Spacer */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </>
  );
} 