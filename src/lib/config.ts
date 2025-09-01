/**
 * Application Configuration
 * Centralized configuration for environment variables and app settings
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  },

  // Development Settings
  dev: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // Application Settings
  app: {
    name: 'Digital Filing System',
    version: '1.0.0',
    supportEmail: 'support@dfs.co.ke',
  },

  // File Upload Settings
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
    ],
  },

  // Authentication Settings
  auth: {
    tokenKey: 'dfs_access_token',
    refreshTokenKey: 'dfs_refresh_token',
    userKey: 'dfs_user',
    otpLength: 6,
    otpExpiryMinutes: 10,
  },

  // UI Settings
  ui: {
    itemsPerPage: 20,
    debounceDelay: 300,
    toastDuration: 5000,
  },
} as const;

export default config;
