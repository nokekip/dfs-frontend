/**
 * Custom hook for authentication operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { config } from '../lib/config';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  OTPVerificationRequest,
  PasswordResetRequest
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // General loading state (for initial auth check)
  isLoginLoading: boolean; // Specific to login operations
  isLogoutLoading: boolean; // Specific to logout operations
  error: string | null;
  pendingOtpUser: User | null; // Store user info during OTP flow
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<{ requiresOtp: boolean; message?: string; user?: User }>;
  register: (data: RegisterRequest) => Promise<boolean>;
  verifyOTP: (data: OTPVerificationRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (data: PasswordResetRequest) => Promise<boolean>;
  updateProfile: (data: Partial<User> & { profilePictureFile?: File; removeProfilePicture?: boolean }) => Promise<boolean>;
  refreshUser: () => void;
  clearError: () => void;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isLoginLoading: false,
    isLogoutLoading: false,
    error: null,
    pendingOtpUser: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(config.auth.tokenKey);
        const userString = localStorage.getItem(config.auth.userKey);
        
        if (token && userString) {
          const user = JSON.parse(userString) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isLoginLoading: false,
            isLogoutLoading: false,
            error: null,
            pendingOtpUser: null,
          });
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication',
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ requiresOtp: boolean; message?: string; user?: User }> => {
    setState(prev => ({ ...prev, isLoginLoading: true, error: null }));

    try {
      const response = await apiClient.login(credentials);
      
      if (response.success && response.data) {
        // Check if OTP is required
        if (response.data.requiresOtp) {
          setState(prev => ({
            ...prev,
            isLoginLoading: false,
            pendingOtpUser: response.data.user,
          }));

          return {
            requiresOtp: true,
            message: response.message,
            user: response.data.user,
          };
        }

        // Direct login (if tokens are provided immediately)
        if (response.data.tokens) {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            isLoginLoading: false,
            isLogoutLoading: false,
            error: null,
            pendingOtpUser: null,
          });

          toast.success('Welcome back!', {
            description: `Logged in as ${response.data.user.firstName} ${response.data.user.lastName}`,
          });

          return { requiresOtp: false, message: response.message };
        }
      }

      setState(prev => ({ ...prev, isLoginLoading: false }));
      return { requiresOtp: false };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Login failed. Please try again.';

      setState(prev => ({
        ...prev,
        isLoginLoading: false,
        error: errorMessage,
        pendingOtpUser: null,
      }));

      toast.error('Login Failed', {
        description: errorMessage,
      });

      return { requiresOtp: false };
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.register(data);
      
      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));

        toast.success('Registration Successful!', {
          description: response.data?.message || 'Please check your email for verification.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Registration failed. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Registration Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const verifyOTP = useCallback(async (data: OTPVerificationRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.verifyOTP(data);
      
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          isLoginLoading: false,
          isLogoutLoading: false,
          error: null,
          pendingOtpUser: null,
        });

        toast.success('Welcome back!', {
          description: `Welcome ${response.data.user.firstName} ${response.data.user.lastName}`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'OTP verification failed. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Verification Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLogoutLoading: true }));

    try {
      await apiClient.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLoginLoading: false,
        isLogoutLoading: false,
        error: null,
        pendingOtpUser: null,
      });

      toast.success('Logged Out', {
        description: 'You have been logged out successfully.',
      });

    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if API call fails
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLoginLoading: false,
        isLogoutLoading: false,
        error: null,
        pendingOtpUser: null,
      });

    }
  }, []);

  const forgotPassword = useCallback(async (data: PasswordResetRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.forgotPassword(data);
      
      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));

        toast.success('Reset Link Sent', {
          description: response.data?.message || 'Check your email for password reset instructions.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to send reset email. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Reset Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User> & { profilePictureFile?: File; removeProfilePicture?: boolean }): Promise<boolean> => {
    if (!state.user) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateProfile(data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data,
          isLoading: false,
        }));

        toast.success('Profile Updated', {
          description: 'Your profile has been updated successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update profile. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Update Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, [state.user]);

  const refreshUser = useCallback(() => {
    const userStr = localStorage.getItem(config.auth.userKey);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setState(prev => ({ ...prev, user }));
      } catch (error) {
        console.warn('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    verifyOTP,
    logout,
    forgotPassword,
    updateProfile,
    refreshUser,
    clearError,
  };
};

export default useAuth;
