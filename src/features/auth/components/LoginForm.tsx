import React, { useState } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignIn, useSignUp } from '../../../hooks/useAuth';
import { validateEmail, validatePassword } from '../api/auth';
import type { LoginCredentials, RegisterCredentials } from '../../../types';

// shadcn/ui components
import { Button } from '~/src/components/ui/button';
import { Text } from '~/src/components/ui/text';
import { Input } from '~/src/components/ui/input';
import { Label } from '~/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/src/components/ui/card';

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
        Alert.alert('Success!', 'Welcome back to Therapiste!');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8 ">
          <Card className="mx-4 p-6  ">
            <CardHeader className="items-center pb-6">
              <CardTitle className="text-3xl font-bold text-center">
                {isLogin ? 'Welcome Back' : 'Join Therapiste'}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin 
                  ? 'Sign in to continue your journey' 
                  : 'Start your mental health journey with a 3-day free trial'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Form */}
          <View className="space-y-4">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <View className="mb-4">
                <Label className="text-foreground font-medium mb-2">Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChangeText={(text: string) => handleInputChange('fullName', text)}
                  className={errors.fullName ? 'border-destructive' : ''}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  textContentType="name"
                />
                {errors.fullName ? (
                  <Text className="text-destructive text-sm mt-1">{errors.fullName}</Text>
                ) : null}
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Label className="text-foreground font-medium mb-2">Email Address</Label>
              <Input
                value={formData.email}
                onChangeText={(text: string) => handleInputChange('email', text)}
                className={errors.email ? 'border-destructive' : ''}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
              {errors.email ? (
                <Text className="text-destructive text-sm mt-1">{errors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="mb-4">
              <Label className="text-foreground font-medium mb-2">Password</Label>
              <Input
                value={formData.password}
                onChangeText={(text: string) => handleInputChange('password', text)}
                className={errors.password ? 'border-destructive' : ''}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                secureTextEntry
                textContentType={isLogin ? "password" : "newPassword"}
              />
              {errors.password ? (
                <Text className="text-destructive text-sm mt-1">{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <View className="mb-4">
                <Label className="text-foreground font-medium mb-2">Confirm Password</Label>
                <Input
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                  placeholder="Confirm your password"
                  secureTextEntry
                  textContentType="newPassword"
                />
                {errors.confirmPassword ? (
                  <Text className="text-destructive text-sm mt-1">{errors.confirmPassword}</Text>
                ) : null}
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <Button 
                variant="ghost"
                onPress={onForgotPassword}
                className="self-end"
              >
                <Text className="text-primary font-medium">
                  Forgot Password?
                </Text>
              </Button>
            )}
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={signInMutation.isPending || signUpMutation.isPending}
            className="mt-6"
          >
            <Text className="text-primary-foreground font-semibold text-lg">
              {(signInMutation.isPending || signUpMutation.isPending) ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          </Button>

          {/* Toggle Auth Mode */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <Button variant="ghost" onPress={toggleAuthMode} className="px-0">
              <Text className="text-primary font-semibold">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Button>
          </View>

          {/* Trial Information (Register only) */}
          {!isLogin && (
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <Text className="text-blue-800 font-semibold text-center mb-1">
                  🎉 3-Day Free Trial
                </Text>
                <Text className="text-blue-700 text-sm text-center">
                  Get full access to all therapy rooms and features. No credit card required.
                </Text>
              </CardContent>
            </Card>
          )}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 