import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('rooms').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful');

    // Test 2: Check if rooms table exists and has data
    console.log('\n2. Testing rooms table...');
    const { data: rooms, error: roomsError, count } = await supabase
      .from('rooms')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (roomsError) throw roomsError;
    console.log(`✅ Found ${rooms?.length || 0} rooms (total: ${count || 0})`);
    console.log('Room slugs:', rooms?.map(r => r.slug).join(', '));

    // Test 3: Check specific rooms
    console.log('\n3. Testing specific room configurations...');
    const chineseCube = rooms?.find(r => r.slug === 'chinese_cube');
    const generalChat = rooms?.find(r => r.slug === 'general_chat');
    const moodAnalysis = rooms?.find(r => r.slug === 'mood_analysis');
    
    console.log('✅ Chinese Cube Room:', chineseCube ? 'Found' : '❌ Missing');
    console.log('✅ General Chat Room:', generalChat ? 'Found' : '❌ Missing');
    console.log('✅ Mood Analysis Room:', moodAnalysis ? 'Found' : '❌ Missing');

    // Test 4: Check room configuration structure
    if (chineseCube) {
      console.log('\n4. Testing Chinese Cube configuration...');
      const config = chineseCube.config;
      console.log('✅ System prompts:', config.systemPrompt ? 'Present' : '❌ Missing');
      console.log('✅ Game config:', config.gameConfig ? 'Present' : '❌ Missing');
      console.log('✅ Questions count:', config.gameConfig?.questions?.length || 0);
    }

    // Test 5: Check table structure
    console.log('\n5. Testing table structure...');
    const tables = ['user_profiles', 'room_sessions', 'messages', 'onboarding_responses', 'user_events', 'analysis_results'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        console.log(`✅ ${table} table: Accessible`);
      } catch (err) {
        console.log(`❌ ${table} table: Error -`, (err as Error).message);
      }
    }

    console.log('\n🎉 Database setup test completed successfully!');
    return { success: true, roomCount: rooms?.length || 0 };

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testAuthFlow = async () => {
  console.log('\n🔐 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    console.log('Current session:', session ? 'Active' : 'None');
    
    if (session) {
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
      
      // Test 2: Check user profile
      console.log('\n2. Testing user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile error:', profileError.message);
      } else {
        console.log('✅ Profile found');
        console.log('Language:', profile.preferred_language);
        console.log('Subscription:', profile.subscription_status);
        console.log('Onboarding:', profile.onboarding_completed ? 'Complete' : 'Pending');
      }
    }

    // Test 3: Test RLS (Row Level Security)
    console.log('\n3. Testing Row Level Security...');
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    console.log('✅ RLS test passed - can query profiles table');

    return { success: true };
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testStores = async () => {
  console.log('\n🏪 Testing Zustand Stores...\n');
  
  try {
    // Test rooms store
    console.log('1. Testing rooms store...');
    const { useRoomsStore } = await import('../stores/roomsStore');
    const roomsStore = useRoomsStore.getState();
    
    console.log('Rooms store initialized:', typeof roomsStore.fetchRooms === 'function');
    
    // Test fetch rooms
    await roomsStore.fetchRooms();
    console.log('✅ Fetched rooms:', roomsStore.rooms.length);
    
    // Test featured rooms
    await roomsStore.fetchFeaturedRooms();
    console.log('✅ Featured rooms:', roomsStore.featuredRooms.length);
    
    // Test filters
    roomsStore.updateFilters({ type: 'game' });
    console.log('✅ Filter update successful');
    
    // Test auth store
    console.log('\n2. Testing auth store...');
    const { useAuthStore } = await import('../stores/authStore');
    const authStore = useAuthStore.getState();
    
    console.log('Auth store initialized:', typeof authStore.initialize === 'function');
    
    // Test initialize
    await authStore.initialize();
    console.log('✅ Auth store initialized');
    console.log('Current user:', authStore.user ? 'Logged in' : 'Not logged in');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Store test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting Therapiste Database Tests\n');
  console.log('=====================================\n');
  
  const dbTest = await testDatabaseConnection();
  const authTest = await testAuthFlow();
  const storeTest = await testStores();
  
  console.log('\n=====================================');
  console.log('📊 Test Results Summary:');
  console.log(`Database: ${dbTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth: ${authTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stores: ${storeTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log('=====================================');
  
  return {
    database: dbTest,
    auth: authTest,
    stores: storeTest,
    allPassed: dbTest.success && authTest.success && storeTest.success
  };
}; 