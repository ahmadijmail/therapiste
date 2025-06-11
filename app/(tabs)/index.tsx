import { Stack } from 'expo-router';

import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';
import DatabaseTestComponent from '~/src/components/DatabaseTestComponent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Database Tests' }} />
      <View style={styles.container}>
        <DatabaseTestComponent />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
