/**
 * Custom hook for system settings operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient, ApiError } from '../services/api';

interface SystemSettings {
  allowedFileTypes: string[];
  maxFileSize: number;
  siteName: string;
  registrationEnabled: boolean;
}

interface SystemSettingsState {
  settings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface SystemSettingsActions {
  fetchSettings: () => Promise<void>;
  refresh: () => void;
  clearError: () => void;
}

export const useSystemSettings = (): SystemSettingsState & SystemSettingsActions => {
  const [state, setState] = useState<SystemSettingsState>({
    settings: null,
    isLoading: false,
    error: null,
  });

  const fetchSettings = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getPublicSettings();
      
      if (response.success && response.data) {
        setState({
          settings: {
            allowedFileTypes: response.data.allowed_file_types || [],
            maxFileSize: response.data.max_file_size || 10,
            siteName: response.data.site_name || 'Digital Filing System',
            registrationEnabled: response.data.registration_enabled || true,
          },
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch system settings',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch system settings. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Settings Load Failed', {
        description: errorMessage,
      });
    }
  }, []);

  const refresh = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    ...state,
    fetchSettings,
    refresh,
    clearError,
  };
};

export default useSystemSettings;
