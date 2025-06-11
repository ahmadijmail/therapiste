import React, { useState } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignIn, useSignUp } from '../../../hooks/useAuth';
import { validateEmail, validatePassword } from '../api/auth';
import type { LoginCredentials, RegisterCredentials } from '../../../types';

// shadcn/ui components
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { Input } from '~/src/components/ui/input';
import { Label } from '~/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/src/components/ui/card';

const { width, height } = Dimensions.get('window');

interface LoginFormProps {
  onSuccess?: () => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({ 
  onSuccess, 
  onNavigateToRegister, 
  onForgotPassword 
}: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Registration-specific validation
    if (!isLogin) {
      // Full name validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        // Login
        const credentials: LoginCredentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        };

        await signInMutation.mutateAsync(credentials);
        Alert.alert('Welcome Back! 🌟', 'Ready to continue your mental wellness journey?');
        onSuccess?.();
      } else {
        // Register
        const credentials: RegisterCredentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.fullName.trim(),
        };

        await signUpMutation.mutateAsync(credentials);
        Alert.alert(
          'Welcome to Therapiste! 🎉', 
          'Your journey to better mental health starts now. Enjoy your 3-day free trial with full access to all features!'
        );
        onSuccess?.();
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Oops! Something went wrong',
        error instanceof Error ? error.message : `${isLogin ? 'Sign in' : 'Registration'} failed. Please try again.`
      );
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle between login and register
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: formData.email, // Keep email
      password: '',
      fullName: '',
      confirmPassword: '',
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Beautiful gradient background */}
      <LinearGradient
        colors={['#0ea5e9', '#06b6d4', '#10b981']} // Sky blue to cyan to emerald
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      
      {/* Floating orbs for visual interest */}
      <View className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <View className="absolute top-40 right-8 w-24 h-24 bg-white/15 rounded-full blur-lg" />
      <View className="absolute bottom-32 left-16 w-40 h-40 bg-white/8 rounded-full blur-2xl" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo and branding section */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4 therapy-glow">
                <Text className="text-3xl">🧠</Text>
              </View>
              <Text className="text-4xl font-bold text-white mb-2 text-center">
                Therapiste
              </Text>
              <Text className="text-white/80 text-lg text-center leading-6">
                Your personal mental wellness companion
              </Text>
            </View>

            {/* Main auth card */}
            <Card className="mx-4 bg-white/95 backdrop-blur-lg border-0 therapy-card-shadow">
              <CardHeader className="items-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-center text-slate-800">
                  {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
                </CardTitle>
                <CardDescription className="text-center text-slate-600 mt-2">
                  {isLogin 
                    ? 'Continue your path to mental wellness' 
                    : 'Start your transformation with a 3-day free trial'
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {/* Form */}
                <View className="space-y-5">
                  {/* Full Name (Register only) */}
                  {!isLogin && (
                    <View>
                      <Label className="text-slate-700 font-semibold mb-2 text-base">Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChangeText={(text: string) => handleInputChange('fullName', text)}
                        className={`h-14 text-base border-2 rounded-xl px-4 ${
                          errors.fullName 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-slate-200 bg-white focus:border-sky-400'
                        }`}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        textContentType="name"
                      />
                      {errors.fullName ? (
                        <Text className="text-red-500 text-sm mt-2 ml-1">{errors.fullName}</Text>
                      ) : null}
                    </View>
                  )}

                  {/* Email */}
                  <View>
                    <Label className="text-slate-700 font-semibold mb-2 text-base">Email Address</Label>
                    <Input
                      value={formData.email}
                      onChangeText={(text: string) => handleInputChange('email', text)}
                      className={`h-14 text-base border-2 rounded-xl px-4 ${
                        errors.email 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-200 bg-white focus:border-sky-400'
                      }`}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                    />
                    {errors.email ? (
                      <Text className="text-red-500 text-sm mt-2 ml-1">{errors.email}</Text>
                    ) : null}
                  </View>

                  {/* Password */}
                  <View>
                    <Label className="text-slate-700 font-semibold mb-2 text-base">Password</Label>
                    <Input
                      value={formData.password}
                      onChangeText={(text: string) => handleInputChange('password', text)}
                      className={`h-14 text-base border-2 rounded-xl px-4 ${
                        errors.password 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-200 bg-white focus:border-sky-400'
                      }`}
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      secureTextEntry
                      textContentType={isLogin ? "password" : "newPassword"}
                    />
                    {errors.password ? (
                      <Text className="text-red-500 text-sm mt-2 ml-1">{errors.password}</Text>
                    ) : null}
                  </View>

                  {/* Confirm Password (Register only) */}
                  {!isLogin && (
                    <View>
                      <Label className="text-slate-700 font-semibold mb-2 text-base">Confirm Password</Label>
                      <Input
                        value={formData.confirmPassword}
                        onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
                        className={`h-14 text-base border-2 rounded-xl px-4 ${
                          errors.confirmPassword 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-slate-200 bg-white focus:border-sky-400'
                        }`}
                        placeholder="Confirm your password"
                        secureTextEntry
                        textContentType="newPassword"
                      />
                      {errors.confirmPassword ? (
                        <Text className="text-red-500 text-sm mt-2 ml-1">{errors.confirmPassword}</Text>
                      ) : null}
                    </View>
                  )}

                  {/* Forgot Password (Login only) */}
                  {isLogin && (
                    <View className="items-end">
                      <Button 
                        variant="ghost"
                        onPress={onForgotPassword}
                        className="p-0"
                      >
                        <Text className="text-sky-600 font-semibold">
                          Forgot Password?
                        </Text>
                      </Button>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <View className="mt-8">
                  <Button
                    onPress={handleSubmit}
                    disabled={signInMutation.isPending || signUpMutation.isPending}
                    className="h-14 rounded-xl therapy-gradient border-0"
                  >
                    <Text className="text-white font-bold text-lg">
                      {(signInMutation.isPending || signUpMutation.isPending) 
                        ? 'Please wait...' 
                        : isLogin ? 'Sign In' : 'Create Account'
                      }
                    </Text>
                  </Button>
                </View>

                {/* Toggle Auth Mode */}
                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-slate-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </Text>
                  <Button variant="ghost" onPress={toggleAuthMode} className="px-0">
                    <Text className="text-sky-600 font-bold">
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Button>
                </View>

                {/* Trial Information (Register only) */}
                {!isLogin && (
                  <View className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl border border-emerald-200">
                    <View className="flex-row items-center justify-center mb-2">
                      <Text className="text-2xl mr-2">🎉</Text>
                      <Text className="text-emerald-800 font-bold text-lg">
                        3-Day Free Trial
                      </Text>
                    </View>
                    <Text className="text-emerald-700 text-center leading-5">
                      Full access to all therapy rooms, personalized insights, and premium features. No credit card required.
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>

            {/* Bottom features showcase */}
            <View className="mt-8 px-4">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                    <Text className="text-xl">🎯</Text>
                  </View>
                  <Text className="text-white/90 text-sm font-medium">Personalized</Text>
                </View>
                <View className="items-center">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                    <Text className="text-xl">🔒</Text>
                  </View>
                  <Text className="text-white/90 text-sm font-medium">Secure</Text>
                </View>
                <View className="items-center">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-2">
                    <Text className="text-xl">📈</Text>
                  </View>
                  <Text className="text-white/90 text-sm font-medium">Progress</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}