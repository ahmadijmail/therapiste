import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { runAllTests, testDatabaseConnection, testAuthFlow, testStores } from '../utils/testDatabase';

interface TestResult {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export default function DatabaseTestComponent() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      console.log('Starting database tests...');
      const results = await runAllTests();
      setTestResults(results);
      
      if (results.allPassed) {
        Alert.alert('✅ Success!', 'All tests passed! Your database is working correctly.');
      } else {
        Alert.alert('⚠️ Issues Found', 'Some tests failed. Check the console for details.');
      }
    } catch (error) {
      console.error('Test runner error:', error);
      Alert.alert('❌ Error', 'Failed to run tests. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (testName: string, testFunction: () => Promise<TestResult>) => {
    setIsRunning(true);
    try {
      console.log(`\n🧪 Running ${testName} test...`);
      const result = await testFunction();
      Alert.alert(
        result.success ? '✅ Test Passed' : '❌ Test Failed',
        `${testName}: ${result.success ? 'Success' : result.error || 'Unknown error'}`
      );
    } catch (error) {
      console.error(`${testName} test error:`, error);
      Alert.alert('❌ Error', `${testName} test failed to run`);
    } finally {
      setIsRunning(false);
    }
  };

  const TestButton = ({ title, onPress, color = '#3b82f6' }: { 
    title: string; 
    onPress: () => void; 
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isRunning}
      className={`bg-blue-500 p-4 rounded-lg mb-3 ${isRunning ? 'opacity-50' : ''}`}
      style={{ backgroundColor: color }}
    >
      <Text className="text-white text-center font-semibold">
        {isRunning ? '⏳ Running...' : title}
      </Text>
    </TouchableOpacity>
  );

  const ResultItem = ({ label, success, details }: { 
    label: string; 
    success: boolean; 
    details?: string;
  }) => (
    <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
      <Text className="font-medium text-gray-900">{label}</Text>
      <View className="flex-row items-center">
        <Text className={`font-bold ${success ? 'text-green-600' : 'text-red-600'}`}>
          {success ? '✅ PASS' : '❌ FAIL'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold text-center mb-6 text-gray-900">
        🧪 Database Tests
      </Text>
      
      <Text className="text-gray-600 text-center mb-6">
        Test your Supabase setup to ensure everything is working correctly
      </Text>

      {/* Test Buttons */}
      <View className="mb-6">
        <TestButton 
          title="🚀 Run All Tests" 
          onPress={runTests}
          color="#10b981"
        />
        
        <TestButton 
          title="🔍 Test Database Connection" 
          onPress={() => runSingleTest('Database', testDatabaseConnection)}
        />
        
        <TestButton 
          title="🔐 Test Authentication" 
          onPress={() => runSingleTest('Authentication', testAuthFlow)}
        />
        
        <TestButton 
          title="🏪 Test Stores" 
          onPress={() => runSingleTest('Stores', testStores)}
        />
      </View>

      {/* Results Display */}
      {testResults && (
        <View className="bg-gray-100 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-4 text-gray-900">
            📊 Test Results
          </Text>
          
          <ResultItem 
            label="Database Connection" 
            success={testResults.database.success}
            details={testResults.database.error}
          />
          
          <ResultItem 
            label="Authentication Flow" 
            success={testResults.auth.success}
            details={testResults.auth.error}
          />
          
          <ResultItem 
            label="Zustand Stores" 
            success={testResults.stores.success}
            details={testResults.stores.error}
          />
          
          <View className="mt-4 p-3 rounded-lg" 
                style={{ backgroundColor: testResults.allPassed ? '#10b981' : '#ef4444' }}>
            <Text className="text-white text-center font-bold">
              {testResults.allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}
            </Text>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View className="mt-6 p-4 bg-blue-50 rounded-lg">
        <Text className="text-blue-800 font-semibold mb-2">📝 Instructions:</Text>
        <Text className="text-blue-700 text-sm leading-5">
          1. Make sure your .env file has the correct Supabase URL and API keys{'\n'}
                     2. Run &quot;Run All Tests&quot; to verify everything is working{'\n'}
           3. Check the console output for detailed test information{'\n'}
           4. If tests fail, verify your Supabase project settings
        </Text>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
} 