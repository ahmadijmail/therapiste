import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../../stores/authStore';
import { validateEmail, validatePassword } from '../api/auth';
import type { LoginCredentials, RegisterCredentials } from '../../../types';

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
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();

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

    setIsLoading(true);
    try {
      if (isLogin) {
        // Login
        const credentials: LoginCredentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        };

        await signIn(credentials);
        Alert.alert('Success!', 'Welcome back to Therapiste!');
        onSuccess?.();
      } else {
        // Register
        const credentials: RegisterCredentials = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          full_name: formData.fullName.trim(),
        };

        await signUp(credentials);
        Alert.alert(
          'Welcome to Therapiste!', 
          'Your account has been created successfully. You now have a 3-day free trial to explore all our features!'
        );
        onSuccess?.();
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`
      );
    } finally {
      setIsLoading(false);
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

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    error, 
    ...props 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    [key: string]: any;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className={`border rounded-lg px-4 py-3 text-gray-900 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error ? (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join Therapiste'}
            </Text>
            <Text className="text-gray-600 text-center">
              {isLogin 
                ? 'Sign in to continue your journey' 
                : 'Start your mental health journey with a 3-day free trial'
              }
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <InputField
                label="Full Name"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                error={errors.fullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                textContentType="name"
              />
            )}

            {/* Email */}
            <InputField
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            {/* Password */}
            <InputField
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              error={errors.password}
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
              secureTextEntry
              textContentType={isLogin ? "password" : "newPassword"}
            />

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <InputField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                textContentType="newPassword"
              />
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity 
                onPress={onForgotPassword}
                className="self-end"
              >
                <Text className="text-blue-600 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`mt-6 bg-blue-600 rounded-lg py-4 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Auth Mode */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text className="text-blue-600 font-semibold">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trial Information (Register only) */}
          {!isLogin && (
            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Text className="text-blue-800 font-semibold text-center mb-1">
                🎉 3-Day Free Trial
              </Text>
              <Text className="text-blue-700 text-sm text-center">
                Get full access to all therapy rooms and features. No credit card required.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 