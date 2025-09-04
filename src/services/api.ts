/**
 * Main API Client
 * Integrates with Django REST Framework backend API
 */

import { config } from '../lib/config';
import { 
  ApiResponse, 
  User, 
  UserPreferences,
  ProfileResponse,
  ChangePasswordRequest,
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  OTPVerificationRequest,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  Teacher,
  TeacherCreateRequest,
  TeacherUpdateRequest,
  TeacherApprovalRequest,
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentShareRequest,
  DocumentShare,
  DocumentCategory,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  DashboardStats,
  TeacherDashboardStats,
  ReportsData,
  SystemSettings,
  SecuritySettings,
  ActivityLog,
  ActivityAction,
  PaginatedResponse,
  SearchFilters,
  SearchResults,
  AuthTokens
} from './types';

import API_ENDPOINTS from './endpoints';

// API Client Class
export class ApiClient {
  private static instance: ApiClient;

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(config.auth.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCurrentUser(): User {
    const userFromStorage = localStorage.getItem(config.auth.userKey);
    let user: User | null = null;
    
    if (userFromStorage) {
      try {
        user = JSON.parse(userFromStorage);
      } catch (error) {
        console.warn('Failed to parse user from localStorage:', error);
      }
    }
    
    if (!user) {
      throw new ApiError('Authentication required', 401);
    }
    return user;
  }

  private requireRole(role: 'admin' | 'teacher'): User {
    const user = this.getCurrentUser();
    if (user.role !== role) {
      throw new ApiError('Insufficient permissions', 403);
    }
    return user;
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        
        if (response.status === 401) {
          // Check if it's a session expiry
          if (errorData.code === 'SESSION_EXPIRED') {
            // Emit session expired event for the app to handle
            window.dispatchEvent(new CustomEvent('session-expired', {
              detail: {
                message: errorData.detail || 'Your session has expired',
                timeout: true
              }
            }));
          }
          
          // Clear auth state for any 401
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem(config.auth.userKey);
        }
        
        throw new ApiError(errorData.error || `HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Request successful',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred', 500);
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/accounts/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Login failed', response.status);
      }

      // Check if OTP is required (Django sends user info + requires_otp flag)
      if (data.requires_otp) {
        // For OTP flow, we return the partial user data
        // Frontend will handle OTP verification separately
        return {
          success: true,
          data: {
            user: {
              id: data.user_id.toString(), // Convert to string to match interface
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              role: data.role,
              username: data.username,
              isActive: true,
              dateJoined: data.date_joined || new Date().toISOString(),
              profilePicture: data.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${data.profile_picture}?t=${Date.now()}` : undefined,
              phoneNumber: data.phone_number,
              bio: data.bio,
            },
            tokens: null, // No tokens until OTP is verified
            requiresOtp: true,
          },
          message: data.message || 'Verification code sent to your email',
        };
      }

      // If no OTP required (direct login when 2FA is disabled)
      if (data.access && data.refresh) {
        const user: User = {
          id: data.user.id.toString(), // Convert to string to match interface
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role,
          username: data.user.username,
          isActive: true,
          dateJoined: data.user.date_joined || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          profilePicture: data.user.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${data.user.profile_picture}?t=${Date.now()}` : undefined,
          phoneNumber: data.user.phone_number,
          bio: data.user.bio,
        };

        const tokens: AuthTokens = {
          access: data.access,
          refresh: data.refresh,
        };

        // Save authentication state
        localStorage.setItem(config.auth.tokenKey, tokens.access);
        localStorage.setItem(config.auth.refreshTokenKey, tokens.refresh);
        localStorage.setItem(config.auth.userKey, JSON.stringify(user));

        return {
          success: true,
          data: { user, tokens },
          message: data.message || 'Login successful',
        };
      }

      // Fallback error
      throw new ApiError('Unexpected response format', 500);

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred during login', 500);
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/accounts/teacher-registration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber || '',
        }),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle validation errors from Django
        if (response.status === 400) {
          const errorMessages = [];
          if (responseData.email) errorMessages.push(`Email: ${Array.isArray(responseData.email) ? responseData.email.join(', ') : responseData.email}`);
          if (responseData.password) errorMessages.push(`Password: ${Array.isArray(responseData.password) ? responseData.password.join(', ') : responseData.password}`);
          if (responseData.first_name) errorMessages.push(`First Name: ${Array.isArray(responseData.first_name) ? responseData.first_name.join(', ') : responseData.first_name}`);
          if (responseData.last_name) errorMessages.push(`Last Name: ${Array.isArray(responseData.last_name) ? responseData.last_name.join(', ') : responseData.last_name}`);
          if (responseData.non_field_errors) errorMessages.push(Array.isArray(responseData.non_field_errors) ? responseData.non_field_errors.join(', ') : responseData.non_field_errors);
          
          const errorMessage = errorMessages.length > 0 ? errorMessages.join('; ') : 'Registration failed';
          throw new ApiError(errorMessage, 400);
        }
        
        throw new ApiError(
          responseData.error || 
          responseData.detail ||
          'Registration failed',
          response.status
        );
      }

      return {
        success: true,
        data: {
          message: responseData.message || 'Registration successful. Your account is pending admin approval.'
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred during registration', 500);
    }
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/accounts/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: data.user_id,
          otp: data.otp,
        }),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiError(responseData.error || 'OTP verification failed', response.status);
      }

      // Success - create user and tokens from response
      const user: User = {
        id: responseData.user.id.toString(), // Convert to string to match interface
        email: responseData.user.email,
        firstName: responseData.user.first_name,
        lastName: responseData.user.last_name,
        role: responseData.user.role,
        username: responseData.user.username,
        isActive: true,
        dateJoined: responseData.user.date_joined || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profilePicture: responseData.user.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${responseData.user.profile_picture}?t=${Date.now()}` : undefined,
        phoneNumber: responseData.user.phone_number,
        bio: responseData.user.bio,
      };

      const tokens: AuthTokens = {
        access: responseData.access,
        refresh: responseData.refresh,
      };

      // Save authentication state
      localStorage.setItem(config.auth.tokenKey, tokens.access);
      localStorage.setItem(config.auth.refreshTokenKey, tokens.refresh);
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));

      return {
        success: true,
        data: { user, tokens },
        message: responseData.message || 'OTP verified successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred during OTP verification', 500);
    }
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      // Try to get tokens from localStorage
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
      
      // Call Django logout endpoint if we have tokens
      if (accessToken && refreshToken) {
        try {
          const response = await fetch(`${config.api.baseUrl}/accounts/auth/logout/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
            signal: AbortSignal.timeout(config.api.timeout),
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.warn('Logout API call failed:', data.error);
            // Continue with local logout even if API call fails
          }
        } catch (error) {
          console.warn('Logout API call error:', error);
          // Continue with local logout even if API call fails
        }
      }

      // Always clear local authentication state
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      localStorage.removeItem(config.auth.userKey);

      return {
        success: true,
        data: { message: 'Logout successful' },
        message: 'Logout successful',
      };

    } catch (error) {
      // Even if logout fails, clear local state
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      localStorage.removeItem(config.auth.userKey);

      return {
        success: true,
        data: { message: 'Logout successful' },
        message: 'Logout successful',
      };
    }
  }

  async forgotPassword(data: PasswordResetRequest): Promise<ApiResponse<PasswordResetResponse>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/accounts/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiError(responseData.error || 'Failed to send password reset email', response.status);
      }

      return {
        success: true,
        data: {
          user_id: responseData.user_id,
          message: responseData.message,
        },
        message: responseData.message || 'Password reset email sent',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred while sending password reset email', 500);
    }
  }

  async resetPassword(data: PasswordResetConfirmRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/accounts/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: data.user_id,
          otp: data.otp,
          password: data.password,
        }),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiError(responseData.error || 'Failed to reset password', response.status);
      }

      return {
        success: true,
        data: { message: responseData.message },
        message: responseData.message || 'Password reset successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred while resetting password', 500);
    }
  }

  // Profile Methods
  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, clear auth state
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem(config.auth.userKey);
        }
        throw new ApiError(data.error || 'Failed to get profile', response.status);
      }

      // Handle both old and new API response formats
      let user: User;
      let preferences: UserPreferences;

      if (data.user && data.preferences) {
        // New format with user and preferences
        user = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role,
          username: data.user.username,
          isActive: data.user.is_active,
          dateJoined: data.user.date_joined,
          lastLogin: data.user.last_login,
          profilePicture: data.user.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${data.user.profile_picture}?t=${Date.now()}` : undefined,
          phoneNumber: data.user.phone_number,
          bio: data.user.bio,
        };

        preferences = {
          id: data.preferences.id,
          two_factor_enabled: data.preferences.two_factor_enabled,
          session_timeout_override: data.preferences.session_timeout_override,
          email_notifications: data.preferences.email_notifications,
          document_shared_notifications: data.preferences.document_shared_notifications,
          system_notifications: data.preferences.system_notifications,
          security_notifications: data.preferences.security_notifications,
          created_at: data.preferences.created_at,
          updated_at: data.preferences.updated_at,
          is_2fa_user_controllable: data.preferences.is_2fa_user_controllable,
          effective_2fa_setting: data.preferences.effective_2fa_setting,
          effective_session_timeout: data.preferences.effective_session_timeout,
          max_allowed_session_timeout: data.preferences.max_allowed_session_timeout,
        };
      } else {
        // Old format - just user data
        user = {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          username: data.username,
          isActive: data.is_active,
          dateJoined: data.date_joined,
          lastLogin: data.last_login,
          profilePicture: data.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${data.profile_picture}?t=${Date.now()}` : undefined,
          phoneNumber: data.phone_number,
          bio: data.bio,
        };

        // Default preferences for backwards compatibility
        preferences = {
          id: '0',
          two_factor_enabled: true,
          session_timeout_override: undefined,
          email_notifications: true,
          document_shared_notifications: true,
          system_notifications: true,
          security_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_2fa_user_controllable: true,
          effective_2fa_setting: true,
          effective_session_timeout: 30,
          max_allowed_session_timeout: 30,
        };
      }

      const profileResponse: ProfileResponse = { user, preferences };

      // Update cached user data
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));

      return {
        success: true,
        data: profileResponse,
        message: 'Profile retrieved successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred while getting profile', 500);
    }
  }

  async updateProfile(data: { 
    user?: Partial<User> & { profilePictureFile?: File; removeProfilePicture?: boolean }; 
    preferences?: Partial<UserPreferences>;
  }): Promise<ApiResponse<ProfileResponse>> {
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      // Prepare request data for new API format
      const requestData: any = {};

      // Handle user data
      if (data.user) {
        const userData: any = {};
        if (data.user.firstName !== undefined) userData.first_name = data.user.firstName;
        if (data.user.lastName !== undefined) userData.last_name = data.user.lastName;
        if (data.user.email !== undefined) userData.email = data.user.email;
        if (data.user.phoneNumber !== undefined) userData.phone_number = data.user.phoneNumber;
        if (data.user.bio !== undefined) userData.bio = data.user.bio;
        
        requestData.user = userData;
      }

      // Handle preferences data
      if (data.preferences) {
        const preferencesData: any = {};
        if (data.preferences.two_factor_enabled !== undefined) preferencesData.two_factor_enabled = data.preferences.two_factor_enabled;
        if (data.preferences.session_timeout_override !== undefined) preferencesData.session_timeout_override = data.preferences.session_timeout_override;
        if (data.preferences.email_notifications !== undefined) preferencesData.email_notifications = data.preferences.email_notifications;
        if (data.preferences.document_shared_notifications !== undefined) preferencesData.document_shared_notifications = data.preferences.document_shared_notifications;
        if (data.preferences.system_notifications !== undefined) preferencesData.system_notifications = data.preferences.system_notifications;
        if (data.preferences.security_notifications !== undefined) preferencesData.security_notifications = data.preferences.security_notifications;
        
        requestData.preferences = preferencesData;
      }

      // Check if we need FormData for file upload
      const hasFileUpload = data.user?.profilePictureFile instanceof File || data.user?.removeProfilePicture;
      
      let requestBody: FormData | string;
      let headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
      };

      if (hasFileUpload) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Add user data to FormData
        if (requestData.user) {
          Object.keys(requestData.user).forEach(key => {
            formData.append(`user.${key}`, requestData.user[key]);
          });
        }
        
        // Add preferences data to FormData
        if (requestData.preferences) {
          Object.keys(requestData.preferences).forEach(key => {
            formData.append(`preferences.${key}`, requestData.preferences[key]);
          });
        }
        
        if (data.user?.profilePictureFile) {
          formData.append('user.profile_picture', data.user.profilePictureFile);
        } else if (data.user?.removeProfilePicture) {
          formData.append('user.remove_profile_picture', 'true');
        }
        
        requestBody = formData;
        // Don't set Content-Type for FormData
      } else {
        // Use JSON
        requestBody = JSON.stringify(requestData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/profile/`, {
        method: 'PUT',
        headers,
        body: requestBody,
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem(config.auth.userKey);
        }
        throw new ApiError(responseData.error || responseData.detail || 'Failed to update profile', response.status);
      }

      // Parse response - should match ProfileResponse format
      const user: User = {
        id: responseData.user.id,
        email: responseData.user.email,
        firstName: responseData.user.first_name,
        lastName: responseData.user.last_name,
        role: responseData.user.role,
        username: responseData.user.username,
        isActive: responseData.user.is_active,
        dateJoined: responseData.user.date_joined,
        lastLogin: responseData.user.last_login,
        profilePicture: responseData.user.profile_picture ? `${config.api.baseUrl.replace('/api', '')}${responseData.user.profile_picture}?t=${Date.now()}` : undefined,
        phoneNumber: responseData.user.phone_number,
        bio: responseData.user.bio,
      };

      const preferences: UserPreferences = {
        id: responseData.preferences.id,
        two_factor_enabled: responseData.preferences.two_factor_enabled,
        session_timeout_override: responseData.preferences.session_timeout_override,
        email_notifications: responseData.preferences.email_notifications,
        document_shared_notifications: responseData.preferences.document_shared_notifications,
        system_notifications: responseData.preferences.system_notifications,
        security_notifications: responseData.preferences.security_notifications,
        created_at: responseData.preferences.created_at,
        updated_at: responseData.preferences.updated_at,
        is_2fa_user_controllable: responseData.preferences.is_2fa_user_controllable,
        effective_2fa_setting: responseData.preferences.effective_2fa_setting,
        effective_session_timeout: responseData.preferences.effective_session_timeout,
        max_allowed_session_timeout: responseData.preferences.max_allowed_session_timeout,
      };

      const profileResponse: ProfileResponse = { user, preferences };

      // Update cached user data
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));

      return {
        success: true,
        data: profileResponse,
        message: 'Profile updated successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred while updating profile', 500);
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem(config.auth.userKey);
        }
        throw new ApiError(responseData.error || responseData.detail || 'Failed to change password', response.status);
      }

      return {
        success: true,
        data: { message: responseData.message || 'Password changed successfully' },
        message: responseData.message || 'Password changed successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred while changing password', 500);
    }
  }

  // Teacher Methods
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/teachers/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Convert backend response to frontend Teacher interface
      const teachers: Teacher[] = data.map((teacher: any) => ({
        id: teacher.id,
        user: {
          id: teacher.user.id,
          email: teacher.user.email,
          firstName: teacher.user.first_name,
          lastName: teacher.user.last_name,
          
          role: teacher.user.role,
          phoneNumber: teacher.user.phone_number,
          bio: teacher.user.bio,
          profilePicture: teacher.user.profile_picture,
          isActive: teacher.user.is_active,
          dateJoined: teacher.user.date_joined,
          lastLogin: teacher.user.last_login,
        },
        phoneNumber: teacher.user.phone_number,
        bio: teacher.user.bio,
        status: teacher.status,
        approvedBy: teacher.approved_by,
        approvedAt: teacher.approved_at,
        rejectedBy: teacher.rejected_by,
        rejectedAt: teacher.rejected_at,
        rejectionReason: teacher.rejection_reason,
        documentsCount: teacher.documents_count || 0,
        sharedDocumentsCount: teacher.shared_documents_count || 0,
        totalDownloads: teacher.total_downloads || 0,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      }));

      return {
        success: true,
        data: teachers,
        message: 'Teachers retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch teachers', 500);
    }
  }

  async approveTeacher(teacherId: string, data: TeacherApprovalRequest): Promise<ApiResponse<Teacher>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const endpoint = data.approved ? 'approve' : 'reject';
      const url = `${config.api.baseUrl}/accounts/teachers/${teacherId}/${endpoint}/`;

      const requestBody = data.approved ? {} : { rejection_reason: data.rejectionReason };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || `Failed to ${data.approved ? 'approve' : 'reject'} teacher`, response.status);
      }

      const responseData = await response.json();
      const teacher = responseData.teacher;
      
      // Convert backend response to frontend Teacher interface
      const convertedTeacher: Teacher = {
        id: teacher.id,
        user: {
          id: teacher.user.id,
          email: teacher.user.email,
          firstName: teacher.user.first_name,
          lastName: teacher.user.last_name,
          
          role: teacher.user.role,
          phoneNumber: teacher.user.phone_number,
          bio: teacher.user.bio,
          profilePicture: teacher.user.profile_picture,
          isActive: teacher.user.is_active,
          dateJoined: teacher.user.date_joined,
          lastLogin: teacher.user.last_login,
        },
        phoneNumber: teacher.user.phone_number,
        bio: teacher.user.bio,
        status: teacher.status,
        approvedBy: teacher.approved_by,
        approvedAt: teacher.approved_at,
        rejectedBy: teacher.rejected_by,
        rejectedAt: teacher.rejected_at,
        rejectionReason: teacher.rejection_reason,
        documentsCount: teacher.documents_count || 0,
        sharedDocumentsCount: teacher.shared_documents_count || 0,
        totalDownloads: teacher.total_downloads || 0,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        data: convertedTeacher,
        message: responseData.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to ${data.approved ? 'approve' : 'reject'} teacher`, 500);
    }
  }

  async createTeacher(data: TeacherCreateRequest): Promise<ApiResponse<Teacher>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // Convert frontend request to backend format
      const requestData = {
        email: data.user.email,
        first_name: data.user.firstName,
        last_name: data.user.lastName,
        password: data.user.password,
        phone_number: data.phoneNumber || '',
        bio: data.bio || '',
      };

      const response = await fetch(`${config.api.baseUrl}/accounts/teachers/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (response.status === 400) {
          const errorMessage = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          throw new ApiError(errorMessage, 400);
        }
        
        throw new ApiError('Failed to create teacher', response.status);
      }

      const teacher = await response.json();
      
      // Convert backend response to frontend Teacher interface
      const convertedTeacher: Teacher = {
        id: teacher.id,
        user: {
          id: teacher.user.id,
          email: teacher.user.email,
          firstName: teacher.user.first_name,
          lastName: teacher.user.last_name,
          
          role: teacher.user.role,
          phoneNumber: teacher.user.phone_number,
          bio: teacher.user.bio,
          profilePicture: teacher.user.profile_picture,
          isActive: teacher.user.is_active,
          dateJoined: teacher.user.date_joined,
          lastLogin: teacher.user.last_login,
        },
        phoneNumber: teacher.user.phone_number,
        bio: teacher.user.bio,
        status: teacher.status,
        approvedBy: teacher.approved_by,
        approvedAt: teacher.approved_at,
        rejectedBy: teacher.rejected_by,
        rejectedAt: teacher.rejected_at,
        rejectionReason: teacher.rejection_reason,
        documentsCount: teacher.documents_count || 0,
        sharedDocumentsCount: teacher.shared_documents_count || 0,
        totalDownloads: teacher.total_downloads || 0,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        data: convertedTeacher,
        message: 'Teacher created successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create teacher', 500);
    }
  }

  async updateTeacher(teacherId: string, data: TeacherUpdateRequest): Promise<ApiResponse<Teacher>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // For status changes, use the suspend endpoint
      if (data.status !== undefined) {
        const response = await fetch(`${config.api.baseUrl}/accounts/teachers/${teacherId}/suspend/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApiError(errorData.error || 'Failed to update teacher status', response.status);
        }

        const responseData = await response.json();
        const teacher = responseData.teacher;
        
        // Convert backend response to frontend Teacher interface
        const convertedTeacher: Teacher = {
          id: teacher.id,
          user: {
            id: teacher.user.id,
            email: teacher.user.email,
            firstName: teacher.user.first_name,
            lastName: teacher.user.last_name,
            role: teacher.user.role,
            phoneNumber: teacher.user.phone_number,
            bio: teacher.user.bio,
            profilePicture: teacher.user.profile_picture,
            isActive: teacher.user.is_active,
            dateJoined: teacher.user.date_joined,
            lastLogin: teacher.user.last_login,
          },
          phoneNumber: teacher.user.phone_number,
          bio: teacher.user.bio,
          status: teacher.status,
          approvedBy: teacher.approved_by,
          approvedAt: teacher.approved_at,
          rejectedBy: teacher.rejected_by,
          rejectedAt: teacher.rejected_at,
          rejectionReason: teacher.rejection_reason,
          documentsCount: teacher.documents_count || 0,
          sharedDocumentsCount: teacher.shared_documents_count || 0,
          totalDownloads: teacher.total_downloads || 0,
          createdAt: teacher.created_at,
          updatedAt: teacher.updated_at,
        };

        return {
          success: true,
          data: convertedTeacher,
          message: responseData.message,
        };
      }

      // For other updates, use the regular PATCH endpoint
      const requestData: any = {};
      if (data.phoneNumber !== undefined) requestData.phone_number = data.phoneNumber;
      if (data.bio !== undefined) requestData.bio = data.bio;

      const response = await fetch(`${config.api.baseUrl}/accounts/teachers/${teacherId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new ApiError('Failed to update teacher', response.status);
      }

      const teacher = await response.json();
      
      // Convert backend response to frontend Teacher interface
      const convertedTeacher: Teacher = {
        id: teacher.id,
        user: {
          id: teacher.user.id,
          email: teacher.user.email,
          firstName: teacher.user.first_name,
          lastName: teacher.user.last_name,
          
          role: teacher.user.role,
          phoneNumber: teacher.user.phone_number,
          bio: teacher.user.bio,
          profilePicture: teacher.user.profile_picture,
          isActive: teacher.user.is_active,
          dateJoined: teacher.user.date_joined,
          lastLogin: teacher.user.last_login,
        },
        phoneNumber: teacher.user.phone_number,
        bio: teacher.user.bio,
        status: teacher.status,
        approvedBy: teacher.approved_by,
        approvedAt: teacher.approved_at,
        rejectedBy: teacher.rejected_by,
        rejectedAt: teacher.rejected_at,
        rejectionReason: teacher.rejection_reason,
        documentsCount: teacher.documents_count || 0,
        sharedDocumentsCount: teacher.shared_documents_count || 0,
        totalDownloads: teacher.total_downloads || 0,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        data: convertedTeacher,
        message: 'Teacher updated successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update teacher', 500);
    }
  }

  async deleteTeacher(teacherId: string): Promise<ApiResponse<void>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/teachers/${teacherId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Teacher not found', 404);
        }
        throw new ApiError('Failed to delete teacher', response.status);
      }

      return {
        success: true,
        message: 'Teacher deleted successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete teacher', 500);
    }
  }

  // Document Methods
  async getDocuments(filters?: SearchFilters): Promise<ApiResponse<Document[]>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.teacher) {
        params.append('teacher', filters.teacher);
      }
      if (filters?.fileType) {
        params.append('file_type', filters.fileType);
      }
      if (filters?.query) {
        params.append('search', filters.query);
      }

      const queryString = params.toString();
      const url = queryString 
        ? `${config.api.baseUrl}/documents/documents/?${queryString}`
        : `${config.api.baseUrl}/documents/documents/`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Convert backend response to frontend Document interface
      const documents: Document[] = data.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        fileType: doc.file_type,
        filePath: doc.file,
        category: {
          id: doc.category,
          name: doc.category_name,
          description: '',
          requiresClassSubject: false,
          isActive: true,
          documentsCount: 0,
          createdAt: '',
          updatedAt: '',
        },
        teacher: {
          id: doc.teacher,
          user: {
            id: doc.teacher,
            email: '',
            firstName: doc.teacher_name.split(' ')[0] || '',
            lastName: doc.teacher_name.split(' ').slice(1).join(' ') || '',
            role: 'teacher',
            phoneNumber: '',
            bio: '',
            profilePicture: undefined,
            isActive: true,
            dateJoined: '',
          },
          specialization: '',
          employeeId: '',
          department: '',
          qualifications: [],
          yearsOfExperience: 0,
          classesTeaching: [],
          subjectsTeaching: [],
          documentsCount: 0,
          sharedDocumentsCount: 0,
          approvalStatus: 'approved',
          experience: '',
          isApproved: true,
          isSuspended: false,
          rejectionReason: null,
          approvalDate: null,
          createdAt: '',
          updatedAt: '',
        },
        classLevel: doc.class_level,
        subject: doc.subject,
        isShared: doc.is_shared,
        sharedAt: doc.shared_at,
        downloadCount: doc.download_count,
        status: doc.status,
        sharedWith: doc.shared_with_users || [],
        tags: [],
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        public_share_url: doc.public_share_url || undefined,
        shared_with_emails: doc.shared_with_emails || [],
      }));

      return {
        success: true,
        data: documents,
        message: 'Documents retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch documents', 500);
    }
  }

  async createDocument(data: DocumentCreateRequest): Promise<ApiResponse<Document>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('Authentication required', 401);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('file', data.file);
      formData.append('category', data.categoryId);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.classLevel) {
        formData.append('class_level', data.classLevel);
      }
      
      if (data.subject) {
        formData.append('subject', data.subject);
      }
      
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', data.tags.join(','));
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.detail || 
                            responseData.error || 
                            responseData.message ||
                            'Failed to create document';
        throw new ApiError(errorMessage, response.status);
      }

      return {
        success: true,
        data: responseData,
        message: 'Document uploaded successfully',
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('An unexpected error occurred during document upload', 500);
    }
  }

  async shareDocument(documentId: string, shareData: DocumentShareRequest): Promise<ApiResponse<DocumentShare>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/share/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const responseData = await response.json();

      // Transform snake_case to camelCase
      const transformedData: DocumentShare = {
        id: responseData.id,
        document: responseData.document,
        shared_by: responseData.shared_by,
        shared_with: responseData.shared_with,
        share_type: responseData.share_type,
        share_token: responseData.share_token,
        can_download: responseData.can_download,
        can_view: responseData.can_view,
        is_active: responseData.is_active,
        expires_at: responseData.expires_at,
        shared_at: responseData.shared_at,
        public_url: responseData.public_url,
      };

      return {
        success: true,
        data: transformedData,
        message: 'Document shared successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to share document', 500);
    }
  }

  async unshareDocument(documentId: string): Promise<ApiResponse<{ message: string; shares_revoked: number }>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/unshare/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: {
          message: responseData.message,
          shares_revoked: responseData.shares_revoked,
        },
        message: 'Document unshared successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to unshare document', 500);
    }
  }

  async getDocumentShares(): Promise<ApiResponse<DocumentShare[]>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/shares/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Convert backend response to frontend DocumentShare interface
      const shares: DocumentShare[] = data.map((share: any) => ({
        id: share.id,
        document: share.document,
        shared_by: share.shared_by,
        shared_with: share.shared_with,
        share_type: share.share_type,
        share_token: share.share_token,
        can_download: share.can_download,
        can_view: share.can_view,
        is_active: share.is_active,
        expires_at: share.expires_at,
        shared_at: share.shared_at,
        public_url: share.public_url,
        // Additional fields from serializer
        shared_by_name: share.shared_by_name,
        shared_with_name: share.shared_with_name,
        document_title: share.document_title,
        document_file_name: share.document_file_name,
        document_file_type: share.document_file_type,
        document_file_size: share.document_file_size,
        document_file_size_mb: share.document_file_size_mb,
        document_download_count: share.document_download_count,
        document_category_id: share.document_category_id,
        document_category_name: share.document_category_name,
        document_description: share.document_description,
        document_class_level: share.document_class_level,
        document_subject: share.document_subject,
        document_status: share.document_status,
        document_created_at: share.document_created_at,
        is_expired: share.is_expired,
      }));

      return {
        success: true,
        data: shares,
        message: 'Document shares retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch document shares', 500);
    }
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return {
        success: true,
        data: { message: 'Document deleted successfully' },
        message: 'Document deleted successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete document', 500);
    }
  }

  async adminDeleteDocument(documentId: string): Promise<ApiResponse<{ message: string }>> {
    // This method requires admin role
    this.requireRole('admin');

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/admin-delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return {
        success: true,
        data: { message: 'Document deleted by admin successfully' },
        message: 'Document deleted by admin successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete document', 500);
    }
  }

  async previewDocument(documentId: string, shareToken?: string): Promise<string> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const url = new URL(`${config.api.baseUrl}/documents/documents/${documentId}/preview/`);
      if (shareToken) {
        url.searchParams.append('token', shareToken);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      // Create blob URL for preview
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to preview document', 500);
    }
  }

  async downloadDocument(documentId: string, shareToken?: string): Promise<void> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const url = new URL(`${config.api.baseUrl}/documents/documents/${documentId}/download/`);
      if (shareToken) {
        url.searchParams.append('token', shareToken);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'download';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to download document', 500);
    }
  }

  async updateDocument(documentId: string, data: DocumentUpdateRequest): Promise<ApiResponse<Document>> {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // Convert camelCase to snake_case for backend
      const backendData: any = {};
      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.status !== undefined) backendData.status = data.status;
      if (data.classLevel !== undefined) backendData.class_level = data.classLevel;
      if (data.subject !== undefined) backendData.subject = data.subject;
      if (data.categoryId !== undefined) backendData.category = data.categoryId;

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const responseData = await response.json();
      
      // Convert backend response to frontend Document interface
      const document: Document = {
        id: responseData.id,
        title: responseData.title,
        description: responseData.description,
        fileName: responseData.file_name,
        fileSize: responseData.file_size,
        fileType: responseData.file_type,
        filePath: responseData.file,
        category: {
          id: responseData.category,
          name: responseData.category_name,
          description: '',
          requiresClassSubject: false,
          isActive: true,
          documentsCount: 0,
          createdAt: '',
          updatedAt: '',
        },
        teacher: {
          id: responseData.teacher,
          user: {
            id: responseData.teacher,
            email: '',
            firstName: responseData.teacher_name.split(' ')[0] || '',
            lastName: responseData.teacher_name.split(' ').slice(1).join(' ') || '',
            role: 'teacher',
            phoneNumber: '',
            bio: '',
            profilePicture: undefined,
            isActive: true,
            dateJoined: responseData.created_at,
          },
          status: 'active',
          documentsCount: 0,
          sharedDocumentsCount: 0,
          totalDownloads: 0,
          createdAt: responseData.created_at,
          updatedAt: responseData.updated_at,
        },
        classLevel: responseData.class_level,
        subject: responseData.subject,
        isShared: responseData.is_shared,
        sharedAt: responseData.shared_at,
        downloadCount: responseData.download_count,
        status: responseData.status,
        sharedWith: responseData.shared_with_users || [],
        tags: [],
        createdAt: responseData.created_at,
        updatedAt: responseData.updated_at,
        public_share_url: responseData.public_share_url || undefined,
        shared_with_emails: responseData.shared_with_emails || [],
      };

      return {
        success: true,
        data: document,
        message: 'Document updated successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update document', 500);
    }
  }

  async flagDocument(documentId: string): Promise<ApiResponse<{ message: string; document_status: string }>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/flag/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to flag document', 500);
    }
  }

  async archiveDocument(documentId: string): Promise<ApiResponse<{ message: string; document_status: string }>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/documents/${documentId}/archive/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to archive document', 500);
    }
  }

  // Category Methods
  async getCategories(): Promise<ApiResponse<DocumentCategory[]>> {
    this.getCurrentUser(); // Just ensure user is authenticated
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/categories/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Convert backend response to frontend DocumentCategory interface
      const categories: DocumentCategory[] = data.map((category: any) => ({
        id: category.id.toString(), // Convert to string to match form state
        name: category.name,
        description: category.description,
        requiresClassSubject: category.requires_class_subject,
        isActive: category.is_active,
        documentsCount: category.documents_count,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }));

      return {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch categories', 500);
    }
  }

  async createCategory(data: CategoryCreateRequest): Promise<ApiResponse<DocumentCategory>> {
    this.requireRole('admin');

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // Convert frontend data to backend format
      const payload = {
        name: data.name,
        description: data.description || '',
        requires_class_subject: data.requiresClassSubject,
      };

      const response = await fetch(`${config.api.baseUrl}/documents/categories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.name?.[0]?.includes('already exists')) {
          throw new ApiError('Category name already exists', 400);
        }
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const category = await response.json();
      
      // Convert backend response to frontend format
      const newCategory: DocumentCategory = {
        id: category.id,
        name: category.name,
        description: category.description,
        requiresClassSubject: category.requires_class_subject,
        isActive: category.is_active,
        documentsCount: category.documents_count,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      };

      return {
        success: true,
        data: newCategory,
        message: 'Category created successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create category', 500);
    }
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<{ message: string }>> {
    this.requireRole('admin');

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new ApiError('Category not found', 404);
        }
        if (response.status === 400 && errorData.detail?.includes('existing documents')) {
          throw new ApiError('Cannot delete category with existing documents', 400);
        }
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      return {
        success: true,
        data: { message: 'Category deleted successfully' },
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to delete category', 500);
    }
  }

  async updateCategory(categoryId: string, data: CategoryUpdateRequest): Promise<ApiResponse<DocumentCategory>> {
    this.requireRole('admin');

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      // Convert frontend data to backend format
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.requiresClassSubject !== undefined) payload.requires_class_subject = data.requiresClassSubject;
      if (data.isActive !== undefined) payload.is_active = data.isActive;

      const response = await fetch(`${config.api.baseUrl}/documents/categories/${categoryId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new ApiError('Category not found', 404);
        }
        if (response.status === 400 && errorData.name?.[0]?.includes('already exists')) {
          throw new ApiError('Category name already exists', 400);
        }
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const category = await response.json();
      
      // Convert backend response to frontend format
      const updatedCategory: DocumentCategory = {
        id: category.id,
        name: category.name,
        description: category.description,
        requiresClassSubject: category.requires_class_subject,
        isActive: category.is_active,
        documentsCount: category.documents_count,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      };

      return {
        success: true,
        data: updatedCategory,
        message: 'Category updated successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to update category', 500);
    }
  }

  async toggleCategoryActive(categoryId: string): Promise<ApiResponse<DocumentCategory>> {
    this.requireRole('admin');

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/documents/categories/${categoryId}/toggle_active/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new ApiError('Category not found', 404);
        }
        if (response.status === 403) {
          throw new ApiError('You do not have permission to manage categories', 403);
        }
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // We need to fetch the updated category to get the full data
      const categoryResponse = await fetch(`${config.api.baseUrl}/documents/categories/${categoryId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!categoryResponse.ok) {
        throw new ApiError('Failed to fetch updated category', 500);
      }

      const category = await categoryResponse.json();
      
      // Convert backend response to frontend format
      const updatedCategory: DocumentCategory = {
        id: category.id,
        name: category.name,
        description: category.description,
        requiresClassSubject: category.requires_class_subject,
        isActive: category.is_active,
        documentsCount: category.documents_count,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      };

      return {
        success: true,
        data: updatedCategory,
        message: `Category ${data.is_active ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to toggle category status', 500);
    }
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/admin/dashboard/stats/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        message: 'Dashboard stats retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('Failed to fetch dashboard stats', 500);
    }
  }

  async getTeacherDashboardStats(): Promise<ApiResponse<TeacherDashboardStats>> {
    const user = this.getCurrentUser();
    if (user.role !== 'teacher') {
      throw new ApiError('Only teachers can access teacher dashboard stats', 403);
    }

    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/teacher/dashboard/stats/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        message: 'Teacher dashboard stats retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('Failed to fetch teacher dashboard stats', 500);
    }
  }

  // Reports Methods
  async getReportsData(timeRange: string = '30'): Promise<ApiResponse<ReportsData>> {
    this.requireRole('admin');
    
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await fetch(`${config.api.baseUrl}/accounts/admin/reports/?time_range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.api.timeout),
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        message: 'Reports data retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError('Unable to connect to server. Please check your connection.', 503);
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('Request timeout. Please try again.', 408);
      }

      throw new ApiError('Failed to fetch reports data', 500);
    }
  }

  // Settings Methods
  async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    this.requireRole('admin');
    
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.api.baseUrl}/settings/system/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data;
      
      // Convert snake_case to camelCase for frontend
      const settings: SystemSettings = {
        siteName: data.site_name,
        siteDescription: data.site_description,
        maxFileSize: data.max_file_size,
        allowedFileTypes: data.allowed_file_types,
        sessionTimeout: data.session_timeout,
        maintenanceMode: data.maintenance_mode,
        registrationEnabled: data.registration_enabled,
        requireAdminApproval: data.require_admin_approval,
      };

      return {
        success: true,
        data: settings,
        message: responseData.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch system settings',
      };
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    this.requireRole('admin');
    
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Convert camelCase to snake_case for backend
      const backendData: any = {};
      if (settings.siteName !== undefined) backendData.site_name = settings.siteName;
      if (settings.siteDescription !== undefined) backendData.site_description = settings.siteDescription;
      if (settings.maxFileSize !== undefined) backendData.max_file_size = settings.maxFileSize;
      if (settings.allowedFileTypes !== undefined) {
        // allowedFileTypes should already be an array from AdminSettings component
        backendData.allowed_file_types = settings.allowedFileTypes;
      }
      if (settings.sessionTimeout !== undefined) backendData.session_timeout = settings.sessionTimeout;
      if (settings.maintenanceMode !== undefined) backendData.maintenance_mode = settings.maintenanceMode;
      if (settings.registrationEnabled !== undefined) backendData.registration_enabled = settings.registrationEnabled;
      if (settings.requireAdminApproval !== undefined) backendData.require_admin_approval = settings.requireAdminApproval;

      const response = await fetch(`${config.api.baseUrl}/settings/system/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseSettings = responseData.data;
      
      // Convert snake_case to camelCase for frontend
      const updatedSettings: SystemSettings = {
        siteName: responseSettings.site_name,
        siteDescription: responseSettings.site_description,
        maxFileSize: responseSettings.max_file_size,
        allowedFileTypes: responseSettings.allowed_file_types,
        sessionTimeout: responseSettings.session_timeout,
        maintenanceMode: responseSettings.maintenance_mode,
        registrationEnabled: responseSettings.registration_enabled,
        requireAdminApproval: responseSettings.require_admin_approval,
      };

      return {
        success: true,
        data: updatedSettings,
        message: responseData.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update system settings',
      };
    }
  }

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    this.requireRole('admin');
    
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${config.api.baseUrl}/settings/security/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data;
      
      // Convert snake_case to camelCase for frontend
      const settings: SecuritySettings = {
        twoFactorRequired: data.two_factor_required,
        enableAuditLogs: false, // This field doesn't exist in backend yet, defaulting to false
      };

      return {
        success: true,
        data: settings,
        message: responseData.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch security settings',
      };
    }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    this.requireRole('admin');
    
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Convert camelCase to snake_case for backend
      const backendData: any = {};
      if (settings.twoFactorRequired !== undefined) backendData.two_factor_required = settings.twoFactorRequired;
      // Note: enableAuditLogs is not implemented in backend yet

      const response = await fetch(`${config.api.baseUrl}/settings/security/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseSettings = responseData.data;
      
      // Convert snake_case to camelCase for frontend
      const updatedSettings: SecuritySettings = {
        twoFactorRequired: responseSettings.two_factor_required,
        enableAuditLogs: false, // This field doesn't exist in backend yet, defaulting to false
      };

      return {
        success: true,
        data: updatedSettings,
        message: responseData.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update security settings',
      };
    }
  }

  // Activity Methods
  async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    this.requireRole('admin');
    
    try {
      const response = await this.makeRequest<any[]>(API_ENDPOINTS.AUDIT.LOGS, {
        method: 'GET',
      });

      // Transform backend data to frontend format, filtering out invalid entries
      const transformedLogs: ActivityLog[] = response.data
        .filter((log: any) => log && log.user_id && log.id) // Filter out logs without valid user_id or id
        .map((log: any) => ({
          id: log.id.toString(),
          user: {
            id: log.user_id.toString(),
            email: log.user_email || '',
            firstName: log.user_name?.split(' ')[0] || 'Unknown',
            lastName: log.user_name?.split(' ').slice(1).join(' ') || '',
            role: log.user_role || 'teacher',
            isActive: true,
            dateJoined: log.created_at || new Date().toISOString(),
          },
          action: this.mapBackendActionToFrontend(log.action || ''),
          targetType: log.target_type || undefined,
          targetId: log.target_id ? log.target_id.toString() : undefined,
          targetName: log.target_name || undefined,
          description: log.description || '',
          ipAddress: log.ip_address || undefined,
          userAgent: log.user_agent || undefined,
          severity: this.mapBackendSeverityToFrontend(log.severity || 'LOW'),
          metadata: log.metadata || undefined,
          createdAt: log.created_at || new Date().toISOString(),
        }));

      return {
        success: true,
        data: transformedLogs,
        message: 'Activity logs retrieved successfully',
      };
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      throw error;
    }
  }

  private mapBackendActionToFrontend(backendAction: string): ActivityAction {
    if (!backendAction || typeof backendAction !== 'string') {
      return 'view'; // Default fallback action
    }
    
    // Convert to uppercase for consistent mapping
    const upperAction = backendAction.toUpperCase();
    
    const actionMapping: Record<string, ActivityAction> = {
      // Document actions
      'CREATE_DOCUMENT': 'create',
      'UPLOAD_DOCUMENT': 'create',
      'DOCUMENT_UPLOADED': 'create',
      'UPDATE_DOCUMENT': 'update',
      'MODIFY_DOCUMENT': 'update',
      'EDIT_DOCUMENT': 'update',
      'DELETE_DOCUMENT': 'delete',
      'REMOVE_DOCUMENT': 'delete',
      'VIEW_DOCUMENT': 'view',
      'ACCESS_DOCUMENT': 'view',
      'PREVIEW_DOCUMENT': 'preview',
      'DOWNLOAD_DOCUMENT': 'download',
      'SHARE_DOCUMENT': 'share',
      'FLAG_DOCUMENT': 'flag',
      'UNFLAG_DOCUMENT': 'flag',
      'ARCHIVE_DOCUMENT': 'archive',
      
      // Auth actions
      'LOGIN': 'login',
      'LOGIN_SUCCESS': 'login',
      'LOGOUT': 'logout',
      
      // User actions
      'CREATE_USER': 'create',
      'UPDATE_USER': 'update',
      'DELETE_USER': 'delete',
      'APPROVE_USER': 'approve',
      'REJECT_USER': 'reject',
    };

    return actionMapping[upperAction] || 'view';
  }

  private mapBackendSeverityToFrontend(backendSeverity: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (!backendSeverity || typeof backendSeverity !== 'string') {
      return 'LOW'; // Default fallback severity
    }
    
    // Convert to uppercase for consistent mapping
    const upperSeverity = backendSeverity.toUpperCase();
    
    const severityMapping: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
      'INFO': 'LOW',
      'WARNING': 'MEDIUM',
      'ERROR': 'HIGH',
      'CRITICAL': 'CRITICAL',
      'LOW': 'LOW',
      'MEDIUM': 'MEDIUM',
      'HIGH': 'HIGH',
    };

    return severityMapping[upperSeverity] || 'LOW';
  }

  // System Settings Methods
  async getBasicPublicSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/settings/public/basic/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        message: 'Basic public settings retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch basic public settings', 500);
    }
  }

  async getPublicSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${config.api.baseUrl}/settings/public/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        message: 'Public settings retrieved successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch public settings', 500);
    }
  }
}

// Custom Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
export default apiClient;
