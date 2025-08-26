/**
 * TypeScript interfaces matching Django REST Framework models
 */

// Base types
export type UserRole = 'admin' | 'teacher';
export type TeacherStatus = 'active' | 'pending' | 'suspended';
export type DocumentStatus = 'active' | 'flagged' | 'archived';
export type ActivityAction = 'upload' | 'delete' | 'share' | 'login' | 'register' | 'approve' | 'reject';

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
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
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
  tags?: string[];
}

export interface DocumentShareRequest {
  isShared: boolean;
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
  recentDocuments: Document[];
  recentActivity: ActivityLog[];
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
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
