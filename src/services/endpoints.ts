/**
 * API Endpoints Configuration
 * Matches Django REST Framework URL patterns
 */

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api' 
  : '/api';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login/`,
    REGISTER: `${API_BASE_URL}/auth/register/`,
    LOGOUT: `${API_BASE_URL}/auth/logout/`,
    REFRESH: `${API_BASE_URL}/auth/refresh/`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp/`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password/`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password/`,
  },

  // User profile endpoints
  PROFILE: {
    GET: `${API_BASE_URL}/profile/`,
    UPDATE: `${API_BASE_URL}/profile/`,
    UPLOAD_PHOTO: `${API_BASE_URL}/profile/photo/`,
    DELETE_PHOTO: `${API_BASE_URL}/profile/photo/`,
  },

  // Teacher management endpoints
  TEACHERS: {
    LIST: `${API_BASE_URL}/teachers/`,
    CREATE: `${API_BASE_URL}/teachers/`,
    DETAIL: (id: string) => `${API_BASE_URL}/teachers/${id}/`,
    UPDATE: (id: string) => `${API_BASE_URL}/teachers/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/teachers/${id}/`,
    APPROVE: (id: string) => `${API_BASE_URL}/teachers/${id}/approve/`,
    REJECT: (id: string) => `${API_BASE_URL}/teachers/${id}/reject/`,
    SUSPEND: (id: string) => `${API_BASE_URL}/teachers/${id}/suspend/`,
  },

  // Document management endpoints
  DOCUMENTS: {
    LIST: `${API_BASE_URL}/documents/documents/`,
    CREATE: `${API_BASE_URL}/documents/documents/`,
    DETAIL: (id: string) => `${API_BASE_URL}/documents/documents/${id}/`,
    UPDATE: (id: string) => `${API_BASE_URL}/documents/documents/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/documents/documents/${id}/`,
    DOWNLOAD: (id: string) => `${API_BASE_URL}/documents/documents/${id}/download/`,
    PREVIEW: (id: string) => `${API_BASE_URL}/documents/documents/${id}/preview/`,
    SHARE: (id: string) => `${API_BASE_URL}/documents/documents/${id}/share/`,
    UNSHARE: (id: string) => `${API_BASE_URL}/documents/documents/${id}/unshare/`,
    UPLOAD: `${API_BASE_URL}/documents/documents/upload/`,
  },

  // Category management endpoints
  CATEGORIES: {
    LIST: `${API_BASE_URL}/documents/categories/`,
    CREATE: `${API_BASE_URL}/documents/categories/`,
    DETAIL: (id: string) => `${API_BASE_URL}/documents/categories/${id}/`,
    UPDATE: (id: string) => `${API_BASE_URL}/documents/categories/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/documents/categories/${id}/`,
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/`,
    ACTIVITY_LOGS: `${API_BASE_URL}/admin/activity/`,
    SYSTEM_SETTINGS: `${API_BASE_URL}/admin/settings/system/`,
    SECURITY_SETTINGS: `${API_BASE_URL}/admin/settings/security/`,
    EXPORT_DATA: `${API_BASE_URL}/admin/export/`,
    SYSTEM_HEALTH: `${API_BASE_URL}/admin/health/`,
  },

  // Audit endpoints
  AUDIT: {
    LOGS: `${API_BASE_URL}/audit/logs/`,
    EXPORT: `${API_BASE_URL}/audit/logs/export/`,
    SUMMARY: `${API_BASE_URL}/audit/logs/summary/`,
  },

  // Search endpoints
  SEARCH: {
    DOCUMENTS: `${API_BASE_URL}/search/documents/`,
    TEACHERS: `${API_BASE_URL}/search/teachers/`,
    GLOBAL: `${API_BASE_URL}/search/`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/notifications/`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read/`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read/`,
    SETTINGS: `${API_BASE_URL}/notifications/settings/`,
  },
} as const;

export default API_ENDPOINTS;
