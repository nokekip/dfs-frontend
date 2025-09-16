/**
 * TypeScript interfaces matching Django REST Framework models
 */

// Base types
export type UserRole = 'admin' | 'teacher';
export type TeacherStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type DocumentStatus = 'active' | 'flagged' | 'archived' | 'published';
export type ActivityAction = 'create' | 'update' | 'delete' | 'view' | 'download' | 'share' | 'flag' | 'archive' | 'login' | 'logout' | 'approve' | 'reject' | 'preview';

// User & Authentication types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  dateJoined: string;
  lastLogin?: string;
  profilePicture?: string;
  username?: string; // Added to match Django backend
  phoneNumber?: string; // Added to match Django backend
  bio?: string; // Added to match Django backend
  teacherProfileId?: number; // Teacher profile ID for filtering shares
}

export interface UserPreferences {
  id: string;
  two_factor_enabled: boolean;
  session_timeout_override?: number; // minutes
  email_notifications: boolean;
  document_shared_notifications: boolean;
  system_notifications: boolean;
  security_notifications: boolean;
  created_at: string;
  updated_at: string;
  // System context fields
  is_2fa_user_controllable: boolean;
  effective_2fa_setting: boolean;
  effective_session_timeout: number;
  max_allowed_session_timeout: number;
}

export interface ProfileResponse {
  user: User;
  preferences: UserPreferences;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens | null; // null during OTP flow
  requiresOtp?: boolean; // Added for OTP flow
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export interface OTPVerificationRequest {
  user_id: string; // Changed to match Django backend
  otp: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  user_id: string;
  message: string;
}

export interface PasswordResetConfirmRequest {
  user_id: string;
  otp: string;
  password: string;
}

// Teacher types
export interface Teacher {
  id: string;
  user: User;
  phoneNumber?: string;
  bio?: string;
  status: TeacherStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documentsCount: number;
  sharedDocumentsCount: number;
  totalDownloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherCreateRequest {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
  phoneNumber?: string;
  bio?: string;
}

export interface TeacherUpdateRequest {
  phoneNumber?: string;
  bio?: string;
  profilePicture?: File;
  status?: TeacherStatus;
}

export interface TeacherApprovalRequest {
  approved: boolean;
  rejectionReason?: string;
}

// Document types
export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  requiresClassSubject: boolean;
  documentsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  teacher: Teacher;
  teacherName?: string; // For public shares where full teacher data may not be available
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  classLevel?: string;
  subject?: string;
  isShared: boolean;
  sharedWith: string[]; // Array of user IDs who have access
  sharedAt?: string;
  downloadCount: number;
  status: DocumentStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // New fields for persistent sharing
  public_share_url?: string; // Will be null if no public share exists
  shared_with_emails: Array<{
    email: string;
    name: string;
    shared_at: string;
  }>;
}

export interface DocumentCreateRequest {
  title: string;
  description?: string;
  categoryId: string;
  file: File;
  classLevel?: string;
  subject?: string;
  tags?: string[];
}

export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  classLevel?: string;
  subject?: string;
  status?: string;
  tags?: string[];
}

export interface DocumentShareRequest {
  share_type: 'public' | 'private';
  shared_with?: string; // Teacher ID for private shares
  shared_with_emails?: string[]; // Teacher emails for multiple private shares
  can_download?: boolean;
  can_view?: boolean;
  expires_at?: string; // ISO date string
  message?: string; // Optional message to include with the share
}

export interface DocumentShare {
  id: string;
  document: string; // Document ID
  shared_by: number; // Teacher ID
  shared_with?: number; // Teacher ID for private shares
  share_type: 'public' | 'private';
  share_token: string;
  can_download: boolean;
  can_view: boolean;
  is_active: boolean;
  expires_at?: string;
  shared_at: string;
  public_url?: string;
  // Additional fields from backend serializer
  shared_by_name?: string;
  shared_with_name?: string;
  document_title?: string;
  document_file_name?: string;
  document_file_type?: string;
  document_file_size?: number;
  document_file_size_mb?: number;
  document_download_count?: number;
  document_category_id?: string;
  document_category_name?: string;
  document_description?: string;
  document_class_level?: string;
  document_subject?: string;
  document_status?: string;
  document_created_at?: string;
  is_expired?: boolean;
}

// Category types
export interface CategoryCreateRequest {
  name: string;
  description?: string;
  requiresClassSubject: boolean;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  requiresClassSubject?: boolean;
  isActive?: boolean;
}

// Activity Log types
export interface ActivityLog {
  id: string;
  user: User;
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
  createdAt: string;
}

// Dashboard & Statistics types
export interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  pendingTeachers: number;
  suspendedTeachers: number;
  totalDocuments: number;
  sharedDocuments: number;
  totalCategories: number;
  activeCategories: number;
  totalDownloads: number;
  recentActivity: ActivityLog[];
  documentsUploadedToday: number;
  documentsUploadedThisWeek: number;
  documentsUploadedThisMonth: number;
}

export interface TeacherDashboardStats {
  documentsUploaded: number;
  documentsShared: number;
  totalDownloads: number;
  storageUsed: number; // in MB
  maxStorage: number; // in MB  
  storagePercentage: number; // percentage used
  recentDocuments: Document[];
  recentActivity: ActivityLog[];
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
}

export interface ReportsData {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalDownloads: number;
  storageUsed: number; // in GB
  popularCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  monthlyUploads: Array<{
    month: string;
    uploads: number;
  }>;
  topUploaders: Array<{
    name: string;
    uploads: number;
    downloads: number;
  }>;
  // Percentage changes
  usersChange?: number;
  documentsChange?: number;
  downloadsChange?: number;
  storageChange?: number;
  // Detailed analytics
  storageByFileType?: Array<{
    fileType: string;
    usage: number;
    percentage: number;
  }>;
  topDocuments?: Array<{
    title: string;
    downloadCount: number;
    category: string;
    teacher: string;
  }>;
  activityMetrics?: {
    avgLoginsPerUser: number;
    avgUploadsPerTeacher: number;
    avgDownloadsPerTeacher: number;
  };
  activityPatterns?: {
    mostActiveDay: string;
    mostActiveHour: number;
    hourFormat: string;
  };
}

// Settings types
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
  sessionTimeout: number; // in minutes
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  requireAdminApproval: boolean;
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  enableAuditLogs: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  documentShared: boolean;
  documentComments: boolean;
  weeklyDigest: boolean;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  teacher?: string;
  classLevel?: string;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  fileType?: string;
  status?: string;
  tags?: string[];
}

export interface SearchResults<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// File Upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}
