import React from 'react';
import { Stack } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { useRooms, useRefreshRooms } from '~/src/hooks/useRooms';
import { useUser, useSubscription } from '~/src/hooks/useAuth';

// shadcn/ui components
import { Text } from '~/src/components/ui/text';
import { Button } from '~/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/src/components/ui/card';
import { Badge } from '~/src/components/ui/badge';

export default function RoomsScreen() {
  const { data: rooms = [], isLoading, error, isError } = useRooms();
  const { data: user } = useUser();
  const { data: subscription } = useSubscription();
  const refreshRooms = useRefreshRooms();

  // Debug logging
  console.log('RoomsScreen state:', { 
    roomsCount: rooms.length, 
    isLoading, 
    isError, 
    error: error?.message 
  });

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'conversation': return '💬';
      case 'analysis': return '📊';
      default: return '🏠';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'game': return 'Interactive Game';
      case 'conversation': return 'Conversation';
      case 'analysis': return 'Analysis';
      default: return 'Room';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Therapy Rooms' }} />
      <ScrollView className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Therapy Rooms
          </Text>
          <Text className="text-muted-foreground">
            Explore different therapeutic approaches designed for your mental health journey
          </Text>
        </View>

        {/* Rooms List */}
        <View className="px-6 space-y-4 mb-8">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <Text className="text-center text-muted-foreground">
                  Loading therapy rooms...
                </Text>
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <Text className="text-center text-red-600 font-semibold mb-2">
                  Error loading rooms
                </Text>
                <Text className="text-center text-muted-foreground mb-4">
                  {error?.message || 'Something went wrong'}
                </Text>
                <Button 
                  variant="outline"
                  onPress={() => refreshRooms.mutate()}
                  className="w-full"
                >
                  <Text className="text-primary font-medium">
                    Try Again
                  </Text>
                </Button>
              </CardContent>
            </Card>
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <Card key={room.id} className="bg-card">
                <CardHeader className="pb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3">
                      <Text className="text-2xl">
                        {getRoomTypeIcon(room.type)}
                      </Text>
                      <View>
                        <CardTitle className="text-lg">
                          {room.name_en}
                        </CardTitle>
                        <Text className="text-sm text-muted-foreground">
                          {getRoomTypeLabel(room.type)}
                        </Text>
                      </View>
                    </View>
                    {room.is_premium ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        👑 Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        🆓 Free
                      </Badge>
                    )}
                  </View>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4">
                    {room.description_en}
                  </CardDescription>
                  
                  {/* Room Features */}
                  {room.config && (
                    <View className="mb-4">
                      {room.config.gameConfig?.questions && (
                        <Text className="text-sm text-muted-foreground mb-2">
                          📋 {room.config.gameConfig.questions.length} questions included
                        </Text>
                      )}
                      {room.config.gameConfig?.estimatedDuration && (
                        <Text className="text-sm text-muted-foreground mb-2">
                          ⏱️ ~{room.config.gameConfig.estimatedDuration}
                        </Text>
                      )}
                      {room.config.conversationConfig?.maxMessages && (
                        <Text className="text-sm text-muted-foreground mb-2">
                          💬 Up to {room.config.conversationConfig.maxMessages} messages per session
                        </Text>
                      )}
                    </View>
                  )}

                  <Button 
                    className="w-full"
                    disabled={room.is_premium && subscription?.status !== 'trial' && subscription?.status !== 'active'}
                    onPress={() => console.log('Navigate to room:', room.slug)}
                  >
                    <Text className="text-primary-foreground font-semibold">
                      {room.is_premium && subscription?.status !== 'trial' && subscription?.status !== 'active' 
                        ? 'Upgrade to Access'
                        : 'Enter Room'
                      }
                    </Text>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <Text className="text-center text-muted-foreground mb-4">
                  No therapy rooms available at the moment.
                </Text>
                <Button 
                  variant="outline"
                  onPress={() => refreshRooms.mutate()}
                  className="w-full"
                >
                  <Text className="text-primary font-medium">
                    Refresh
                  </Text>
                </Button>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Trial Information */}
        {subscription?.status === 'trial' && (
          <View className="px-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <Text className="text-blue-800 font-semibold text-center mb-2">
                  🎉 Free Trial Active
                </Text>
                <Text className="text-blue-700 text-sm text-center">
                  You have full access to all therapy rooms during your trial period
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Bottom Spacer */}
        <View className="h-20" />
      </ScrollView>
    </>
  );
}
