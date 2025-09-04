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
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(config.auth.tokenKey);
        
        if (token) {
          // If we have a token, fetch the latest profile data from server
          try {
            console.log('Initializing auth: fetching profile data...');
            const response = await apiClient.getProfile();
            if (response.success && response.data) {
              console.log('Profile data fetched successfully:', response.data);
              setState({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
                isLoginLoading: false,
                isLogoutLoading: false,
                error: null,
                pendingOtpUser: null,
              });
              return;
            }
          } catch (error) {
            // If profile fetch fails, fall back to cached user data
            console.warn('Failed to fetch fresh profile data, using cached data:', error);
          }
          
          // Fallback to cached user data if API call fails
          const userString = localStorage.getItem(config.auth.userKey);
          if (userString) {
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
            return;
          }
        }
        
        // No token or user data found
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
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
    setState(prev => ({ ...prev, isLoginLoading: true, error: null }));

    try {
      const response = await apiClient.verifyOTP(data);
      
      if (response.success && response.data) {
        // Set initial user data from OTP response
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          isLoginLoading: false,
          isLogoutLoading: false,
          error: null,
          pendingOtpUser: null,
        });

        // Fetch complete profile data to get profile picture and other details
        try {
          const profileResponse = await apiClient.getProfile();
          if (profileResponse.success) {
            console.log('Fetched profile data after OTP:', profileResponse.data);
            setState(prev => ({
              ...prev,
              user: profileResponse.data,
            }));
          }
        } catch (profileError) {
          console.warn('Failed to fetch complete profile after login:', profileError);
          // Continue with login even if profile fetch fails
        }

        toast.success('Welcome back!', {
          description: `Welcome ${response.data.user.firstName} ${response.data.user.lastName}`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoginLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'OTP verification failed. Please try again.';

      setState(prev => ({
        ...prev,
        isLoginLoading: false,
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

        // If profile picture was updated, force a refresh to get the latest URL
        if (data.profilePictureFile || data.removeProfilePicture) {
          setTimeout(async () => {
            try {
              const refreshResponse = await apiClient.getProfile();
              if (refreshResponse.success && refreshResponse.data) {
                setState(prev => ({ ...prev, user: refreshResponse.data }));
              }
            } catch (error) {
              console.warn('Failed to refresh profile after image update:', error);
            }
          }, 500); // Small delay to ensure backend has processed the image
        }

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

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setState(prev => ({ ...prev, user: response.data }));
      }
    } catch (error) {
      console.warn('Failed to refresh user profile:', error);
      // Fall back to cached data
      const userStr = localStorage.getItem(config.auth.userKey);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setState(prev => ({ ...prev, user }));
        } catch (error) {
          console.warn('Failed to parse user from localStorage:', error);
        }
      }
    }
  }, [state.isAuthenticated]);

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
