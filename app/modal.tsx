import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '~/src/stores/authStore';

// shadcn/ui components
import { Text } from '~/src/components/ui/text';
import { Button } from '~/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/src/components/ui/card';

export default function Modal() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          presentation: 'modal'
        }} 
      />
      <ScrollView className="flex-1 bg-background">
        <View className="px-6 py-8">
          {/* Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <View>
                  <Text className="text-sm text-muted-foreground">Name</Text>
                  <Text className="text-lg">{user?.full_name || 'Not set'}</Text>
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground">Email</Text>
                  <Text className="text-lg">{user?.email || 'Not set'}</Text>
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground">Subscription</Text>
                  <Text className="text-lg capitalize">
                    {user?.subscription_status || 'Unknown'}
                    {user?.subscription_status === 'trial' && ' 🎉'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <Button variant="outline" className="justify-start">
                  <Text className="text-primary">🌐 Language Settings</Text>
                </Button>
                <Button variant="outline" className="justify-start">
                  <Text className="text-primary">🔔 Notifications</Text>
                </Button>
                <Button variant="outline" className="justify-start">
                  <Text className="text-primary">🔒 Privacy & Security</Text>
                </Button>
                <Button variant="outline" className="justify-start">
                  <Text className="text-primary">❓ Help & Support</Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Actions */}
          <View className="space-y-3">
            <Button 
              variant="destructive"
              onPress={handleSignOut}
              className="w-full"
            >
              <Text className="text-destructive-foreground font-semibold">
                Sign Out
              </Text>
            </Button>
            
            <Button 
              variant="outline"
              onPress={() => router.back()}
              className="w-full"
            >
              <Text className="text-primary font-medium">
                Close
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
