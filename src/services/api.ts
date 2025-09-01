/**
 * Main API Client
 * Integrates with Django REST Framework backend API
 */

import { config } from '../lib/config';
import { 
  ApiResponse, 
  User, 
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
  DocumentCategory,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  DashboardStats,
  TeacherDashboardStats,
  SystemSettings,
  SecuritySettings,
  ActivityLog,
  PaginatedResponse,
  SearchFilters,
  SearchResults,
  AuthTokens
} from './types';

import { mockDataStore } from './mockData';
import API_ENDPOINTS from './endpoints';

// Simulate network delay
const NETWORK_DELAY = 500; // ms

const delay = (ms: number = NETWORK_DELAY): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT tokens
const generateMockToken = (user: User): AuthTokens => ({
  access: `mock_access_token_${user.id}_${Date.now()}`,
  refresh: `mock_refresh_token_${user.id}_${Date.now()}`,
});

// Error simulation helper
const simulateError = (message: string, status: number = 400): never => {
  throw new ApiError(message, status);
};

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
    // Try localStorage first (for integrated methods), then fallback to mockDataStore
    const token = localStorage.getItem(config.auth.tokenKey) || mockDataStore.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCurrentUser(): User {
    // Try localStorage first (for integrated methods), then fallback to mockDataStore
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
      user = mockDataStore.getCurrentUser();
    }
    
    if (!user) {
      simulateError('Authentication required', 401);
    }
    return user;
  }

  private requireRole(role: 'admin' | 'teacher'): User {
    const user = this.getCurrentUser();
    if (user.role !== role) {
      simulateError('Insufficient permissions', 403);
    }
    return user;
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
              id: data.user_id,
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              role: data.role,
              username: data.username,
              isActive: true,
              dateJoined: new Date().toISOString(), // We don't have this from login response
            },
            tokens: null, // No tokens until OTP is verified
            requiresOtp: true,
          },
          message: data.message || 'Verification code sent to your email',
        };
      }

      // If no OTP required (shouldn't happen with current backend, but handling it)
      if (data.access && data.refresh) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          role: data.user.role,
          username: data.user.username,
          isActive: true,
          dateJoined: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
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
    await delay();

    if (data.password !== data.confirmPassword) {
      simulateError('Passwords do not match', 400);
    }

    const users = mockDataStore.getUsers();
    const existingUser = users.find(u => u.email === data.email);

    if (existingUser) {
      simulateError('Email already registered', 400);
    }

    const newUser: User = {
      id: mockDataStore.generateId(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'teacher',
      isActive: false, // Requires email verification
      dateJoined: new Date().toISOString(),
    };

    // Create teacher profile
    const newTeacher: Teacher = {
      id: mockDataStore.generateId(),
      user: newUser,
      status: 'pending',
      documentsCount: 0,
      sharedDocumentsCount: 0,
      totalDownloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    const teachers = mockDataStore.getTeachers();
    teachers.push(newTeacher);

    mockDataStore.saveUsers(users);
    mockDataStore.saveTeachers(teachers);

    // Log activity
    mockDataStore.addActivityLog({
      user: newUser,
      action: 'register',
      description: 'registered for an account',
    });

    return {
      success: true,
      data: { message: 'Registration successful. Please verify your email with the OTP sent to your inbox.' },
      message: 'Registration successful',
    };
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
        id: responseData.user.id,
        email: responseData.user.email,
        firstName: responseData.user.first_name,
        lastName: responseData.user.last_name,
        role: responseData.user.role,
        username: responseData.user.username,
        isActive: true,
        dateJoined: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
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
  async getProfile(): Promise<ApiResponse<User>> {
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

      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        username: data.username,
        isActive: data.is_active,
        dateJoined: data.date_joined,
        lastLogin: data.last_login,
        profilePicture: data.profile_picture,
      };

      // Update cached user data
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));

      return {
        success: true,
        data: user,
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

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      if (!accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      // Transform frontend User fields to backend format
      const backendData: any = {};
      if (data.firstName !== undefined) backendData.first_name = data.firstName;
      if (data.lastName !== undefined) backendData.last_name = data.lastName;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.profilePicture !== undefined) backendData.profile_picture = data.profilePicture;

      const response = await fetch(`${config.api.baseUrl}/accounts/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(backendData),
        signal: AbortSignal.timeout(config.api.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, clear auth state
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem(config.auth.userKey);
        }
        throw new ApiError(responseData.error || 'Failed to update profile', response.status);
      }

      const updatedUser: User = {
        id: responseData.id,
        email: responseData.email,
        firstName: responseData.first_name,
        lastName: responseData.last_name,
        role: responseData.role,
        username: responseData.username,
        isActive: responseData.is_active,
        dateJoined: responseData.date_joined,
        lastLogin: responseData.last_login,
        profilePicture: responseData.profile_picture,
      };

      // Update cached user data
      localStorage.setItem(config.auth.userKey, JSON.stringify(updatedUser));

      return {
        success: true,
        data: updatedUser,
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

  // Teacher Methods
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    await delay();
    
    this.requireRole('admin');
    const teachers = mockDataStore.getTeachers();
    
    return {
      success: true,
      data: teachers,
      message: 'Teachers retrieved successfully',
    };
  }

  async approveTeacher(teacherId: string, data: TeacherApprovalRequest): Promise<ApiResponse<Teacher>> {
    await delay();

    const adminUser = this.requireRole('admin');
    const teachers = mockDataStore.getTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);

    if (teacherIndex === -1) {
      simulateError('Teacher not found', 404);
    }

    const teacher = teachers[teacherIndex];
    
    if (data.approved) {
      teacher.status = 'active';
      teacher.approvedBy = adminUser.id;
      teacher.approvedAt = new Date().toISOString();
      teacher.rejectionReason = undefined;
      teacher.rejectedBy = undefined;
      teacher.rejectedAt = undefined;
    } else {
      teacher.status = 'rejected';
      teacher.rejectedBy = adminUser.id;
      teacher.rejectedAt = new Date().toISOString();
      teacher.rejectionReason = data.rejectionReason;
      teacher.approvedBy = undefined;
      teacher.approvedAt = undefined;
    }
    
    teacher.updatedAt = new Date().toISOString();
    teachers[teacherIndex] = teacher;
    mockDataStore.saveTeachers(teachers);

    // Log activity
    mockDataStore.addActivityLog({
      user: adminUser,
      action: data.approved ? 'approve' : 'reject',
      targetType: 'teacher',
      targetId: teacher.id,
      targetName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      description: `${data.approved ? 'approved' : 'rejected'} teacher account for ${teacher.user.firstName} ${teacher.user.lastName}`,
    });

    return {
      success: true,
      data: teacher,
      message: `Teacher ${data.approved ? 'approved' : 'rejected'} successfully`,
    };
  }

  async createTeacher(data: TeacherCreateRequest): Promise<ApiResponse<Teacher>> {
    await delay();

    const adminUser = this.requireRole('admin');
    const users = mockDataStore.getUsers();

    // Check if email already exists
    if (users.some(u => u.email === data.user.email)) {
      simulateError('Email already registered', 400);
    }

    const newUser: User = {
      id: mockDataStore.generateId(),
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: 'teacher',
      isActive: true, // Admin-created teachers are active by default
      dateJoined: new Date().toISOString(),
    };

    // Create teacher profile
    const newTeacher: Teacher = {
      id: mockDataStore.generateId(),
      user: newUser,
      status: 'active',
      phoneNumber: data.phoneNumber,
      documentsCount: 0,
      sharedDocumentsCount: 0,
      totalDownloads: 0,
      approvedBy: adminUser.id,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    const teachers = mockDataStore.getTeachers();
    teachers.push(newTeacher);

    mockDataStore.saveUsers(users);
    mockDataStore.saveTeachers(teachers);

    // Log activity
    mockDataStore.addActivityLog({
      user: adminUser,
      action: 'create',
      targetType: 'teacher',
      targetId: newTeacher.id,
      targetName: `${newTeacher.user.firstName} ${newTeacher.user.lastName}`,
      description: `created teacher account for ${newTeacher.user.firstName} ${newTeacher.user.lastName}`,
    });

    return {
      success: true,
      data: newTeacher,
      message: 'Teacher created successfully',
    };
  }

  async updateTeacher(teacherId: string, data: TeacherUpdateRequest): Promise<ApiResponse<Teacher>> {
    await delay();

    const adminUser = this.requireRole('admin');
    const teachers = mockDataStore.getTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);

    if (teacherIndex === -1) {
      simulateError('Teacher not found', 404);
    }

    const teacher = teachers[teacherIndex];
    
    // Update the teacher properties
    if (data.phoneNumber !== undefined) {
      teacher.phoneNumber = data.phoneNumber;
    }
    if (data.bio !== undefined) {
      teacher.bio = data.bio;
    }
    if (data.status !== undefined) {
      teacher.status = data.status;
    }
    
    teacher.updatedAt = new Date().toISOString();
    teachers[teacherIndex] = teacher;
    mockDataStore.saveTeachers(teachers);

    // Log activity
    mockDataStore.addActivityLog({
      user: adminUser,
      action: 'update',
      targetType: 'teacher',
      targetId: teacher.id,
      targetName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      description: `updated teacher account for ${teacher.user.firstName} ${teacher.user.lastName}`,
    });

    return {
      success: true,
      data: teacher,
      message: 'Teacher updated successfully',
    };
  }

  async deleteTeacher(teacherId: string): Promise<ApiResponse<void>> {
    await delay();

    const adminUser = this.requireRole('admin');
    const teachers = mockDataStore.getTeachers();
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);

    if (teacherIndex === -1) {
      simulateError('Teacher not found', 404);
    }

    const teacher = teachers[teacherIndex];
    
    // Remove teacher from teachers array
    teachers.splice(teacherIndex, 1);
    mockDataStore.saveTeachers(teachers);

    // Also remove the associated user
    const users = mockDataStore.getUsers();
    const userIndex = users.findIndex(u => u.id === teacher.user.id);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      mockDataStore.saveUsers(users);
    }

    // Remove all documents uploaded by this teacher
    const documents = mockDataStore.getDocuments();
    const updatedDocuments = documents.filter(doc => doc.teacher.id !== teacherId);
    mockDataStore.saveDocuments(updatedDocuments);

    // Log activity
    mockDataStore.addActivityLog({
      user: adminUser,
      action: 'delete',
      targetType: 'teacher',
      targetId: teacher.id,
      targetName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      description: `deleted teacher account for ${teacher.user.firstName} ${teacher.user.lastName}`,
    });

    return {
      success: true,
      data: undefined,
      message: 'Teacher deleted successfully',
    };
  }

  // Document Methods
  async getDocuments(filters?: SearchFilters): Promise<ApiResponse<Document[]>> {
    await delay();

    const user = this.getCurrentUser();
    let documents = mockDataStore.getDocuments();

    // Filter by teacher if not admin
    if (user.role === 'teacher') {
      documents = documents.filter(d => d.teacher.user.id === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        documents = documents.filter(d => d.category.id === filters.category);
      }
      if (filters.query) {
        const query = filters.query.toLowerCase();
        documents = documents.filter(d => 
          d.title.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query)
        );
      }
    }

    return {
      success: true,
      data: documents,
      message: 'Documents retrieved successfully',
    };
  }

  async createDocument(data: DocumentCreateRequest): Promise<ApiResponse<Document>> {
    await delay();

    const user = this.getCurrentUser();
    if (user.role !== 'teacher') {
      simulateError('Only teachers can upload documents', 403);
    }

    const teachers = mockDataStore.getTeachers();
    const teacher = teachers.find(t => t.user.id === user.id);
    if (!teacher) {
      simulateError('Teacher profile not found', 404);
    }

    const categories = mockDataStore.getCategories();
    const category = categories.find(c => c.id === data.categoryId);
    if (!category) {
      simulateError('Category not found', 404);
    }

    // Validate required fields for category
    if (category.requiresClassSubject && (!data.classLevel || !data.subject)) {
      simulateError('Class level and subject are required for this category', 400);
    }

    const newDocument: Document = {
      id: mockDataStore.generateId(),
      title: data.title,
      description: data.description,
      category,
      teacher,
      fileName: data.file.name,
      fileSize: data.file.size,
      fileType: data.file.type,
      filePath: `/uploads/documents/${data.file.name}`,
      classLevel: data.classLevel,
      subject: data.subject,
      isShared: false,
      sharedWith: [], // Initialize as empty array
      downloadCount: 0,
      status: 'published',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const documents = mockDataStore.getDocuments();
    documents.push(newDocument);
    mockDataStore.saveDocuments(documents);

    // Update teacher document count
    teacher.documentsCount += 1;
    teacher.updatedAt = new Date().toISOString();
    const updatedTeachers = teachers.map(t => t.id === teacher.id ? teacher : t);
    mockDataStore.saveTeachers(updatedTeachers);

    // Update category document count
    category.documentsCount += 1;
    category.updatedAt = new Date().toISOString();
    const updatedCategories = categories.map(c => c.id === category.id ? category : c);
    mockDataStore.saveCategories(updatedCategories);

    // Log activity
    mockDataStore.addActivityLog({
      user,
      action: 'upload',
      targetType: 'document',
      targetId: newDocument.id,
      targetName: newDocument.title,
      description: `uploaded "${newDocument.title}"`,
    });

    return {
      success: true,
      data: newDocument,
      message: 'Document uploaded successfully',
    };
  }

  async shareDocument(documentId: string, data: DocumentShareRequest): Promise<ApiResponse<Document>> {
    await delay();

    const user = this.getCurrentUser();
    const documents = mockDataStore.getDocuments();
    const documentIndex = documents.findIndex(d => d.id === documentId);

    if (documentIndex === -1) {
      simulateError('Document not found', 404);
    }

    const document = documents[documentIndex];

    // Check permissions
    if (user.role === 'teacher' && document.teacher.user.id !== user.id) {
      simulateError('You can only share your own documents', 403);
    }

    document.isShared = data.isShared;
    document.sharedAt = data.isShared ? new Date().toISOString() : undefined;
    document.updatedAt = new Date().toISOString();

    documents[documentIndex] = document;
    mockDataStore.saveDocuments(documents);

    // Update teacher shared documents count
    const teachers = mockDataStore.getTeachers();
    const teacher = teachers.find(t => t.id === document.teacher.id);
    if (teacher) {
      teacher.sharedDocumentsCount = documents.filter(d => 
        d.teacher.id === teacher.id && d.isShared
      ).length;
      teacher.updatedAt = new Date().toISOString();
      const updatedTeachers = teachers.map(t => t.id === teacher.id ? teacher : t);
      mockDataStore.saveTeachers(updatedTeachers);
    }

    // Log activity
    mockDataStore.addActivityLog({
      user,
      action: 'share',
      targetType: 'document',
      targetId: document.id,
      targetName: document.title,
      description: `${data.isShared ? 'shared' : 'unshared'} "${document.title}"`,
    });

    return {
      success: true,
      data: document,
      message: `Document ${data.isShared ? 'shared' : 'unshared'} successfully`,
    };
  }

  // Category Methods
  async getCategories(): Promise<ApiResponse<DocumentCategory[]>> {
    await delay();

    const categories = mockDataStore.getCategories();
    
    return {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
    };
  }

  async createCategory(data: CategoryCreateRequest): Promise<ApiResponse<DocumentCategory>> {
    await delay();

    this.requireRole('admin');

    const categories = mockDataStore.getCategories();
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingCategory) {
      simulateError('Category name already exists', 400);
    }

    const newCategory: DocumentCategory = {
      id: mockDataStore.generateId(),
      name: data.name,
      description: data.description || '',
      requiresClassSubject: data.requiresClassSubject,
      documentsCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    mockDataStore.saveCategories(categories);

    return {
      success: true,
      data: newCategory,
      message: 'Category created successfully',
    };
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<{ message: string }>> {
    await delay();

    this.requireRole('admin');

    const categories = mockDataStore.getCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
      simulateError('Category not found', 404);
    }

    const category = categories[categoryIndex];

    if (category.documentsCount > 0) {
      simulateError('Cannot delete category with existing documents', 400);
    }

    categories.splice(categoryIndex, 1);
    mockDataStore.saveCategories(categories);

    return {
      success: true,
      data: { message: 'Category deleted successfully' },
      message: 'Category deleted successfully',
    };
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    await delay();

    this.requireRole('admin');
    const stats = mockDataStore.getDashboardStats();

    return {
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully',
    };
  }

  async getTeacherDashboardStats(): Promise<ApiResponse<TeacherDashboardStats>> {
    await delay();

    const user = this.getCurrentUser();
    if (user.role !== 'teacher') {
      simulateError('Only teachers can access teacher dashboard stats', 403);
    }

    const stats = mockDataStore.getTeacherDashboardStats(user.id);

    return {
      success: true,
      data: stats,
      message: 'Teacher dashboard stats retrieved successfully',
    };
  }

  // Settings Methods
  async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    await delay();

    this.requireRole('admin');
    const settings = mockDataStore.getSystemSettings();

    return {
      success: true,
      data: settings,
      message: 'System settings retrieved successfully',
    };
  }

  async updateSystemSettings(data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    await delay();

    this.requireRole('admin');
    const currentSettings = mockDataStore.getSystemSettings();
    const updatedSettings = { ...currentSettings, ...data };
    
    mockDataStore.saveSystemSettings(updatedSettings);

    return {
      success: true,
      data: updatedSettings,
      message: 'System settings updated successfully',
    };
  }

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    await delay();

    this.requireRole('admin');
    const settings = mockDataStore.getSecuritySettings();

    return {
      success: true,
      data: settings,
      message: 'Security settings retrieved successfully',
    };
  }

  async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    await delay();

    this.requireRole('admin');
    const currentSettings = mockDataStore.getSecuritySettings();
    const updatedSettings = { ...currentSettings, ...data };
    
    mockDataStore.saveSecuritySettings(updatedSettings);

    return {
      success: true,
      data: updatedSettings,
      message: 'Security settings updated successfully',
    };
  }

  // Activity Methods
  async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    await delay();

    this.requireRole('admin');
    const logs = mockDataStore.getActivityLogs();

    return {
      success: true,
      data: logs,
      message: 'Activity logs retrieved successfully',
    };
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
