/**
 * Export all custom hooks for easy importing
 */

export { useAuth } from './useAuth';
export { useTeachers } from './useTeachers';
export { useDocuments } from './useDocuments';
export { useCategories } from './useCategories';
export { useDashboard } from './useDashboard';
export { useSettings } from './useSettings';

// Re-export types for convenience
export type {
  User,
  Teacher,
  Document,
  DocumentCategory,
  DashboardStats,
  TeacherDashboardStats,
  SystemSettings,
  SecuritySettings,
  NotificationSettings,
  ActivityLog,
  LoginRequest,
  RegisterRequest,
  DocumentCreateRequest,
  CategoryCreateRequest,
  SearchFilters,
} from '../services/types';
