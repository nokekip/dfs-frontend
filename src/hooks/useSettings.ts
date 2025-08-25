/**
 * Custom hook for settings management operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  SystemSettings, 
  SecuritySettings,
  NotificationSettings
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface SettingsState {
  systemSettings: SystemSettings | null;
  securitySettings: SecuritySettings | null;
  notificationSettings: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  fetchSystemSettings: () => Promise<void>;
  updateSystemSettings: (data: Partial<SystemSettings>) => Promise<boolean>;
  fetchSecuritySettings: () => Promise<void>;
  updateSecuritySettings: (data: Partial<SecuritySettings>) => Promise<boolean>;
  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (data: Partial<NotificationSettings>) => Promise<boolean>;
  refresh: () => void;
  clearError: () => void;
}

export const useSettings = (userRole: 'admin' | 'teacher'): SettingsState & SettingsActions => {
  const [state, setState] = useState<SettingsState>({
    systemSettings: null,
    securitySettings: null,
    notificationSettings: null,
    isLoading: false,
    error: null,
  });

  const fetchSystemSettings = useCallback(async (): Promise<void> => {
    // Only admin can fetch system settings
    if (userRole !== 'admin') return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getSystemSettings();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          systemSettings: response.data!,
          isLoading: false,
        }));
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

      toast.error('Fetch Failed', {
        description: errorMessage,
      });
    }
  }, [userRole]);

  const updateSystemSettings = useCallback(async (data: Partial<SystemSettings>): Promise<boolean> => {
    // Only admin can update system settings
    if (userRole !== 'admin') return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateSystemSettings(data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          systemSettings: response.data!,
          isLoading: false,
        }));

        toast.success('Settings Updated', {
          description: 'System settings have been updated successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update system settings. Please try again.';

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
  }, [userRole]);

  const fetchSecuritySettings = useCallback(async (): Promise<void> => {
    // Only admin can fetch security settings
    if (userRole !== 'admin') return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getSecuritySettings();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          securitySettings: response.data!,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch security settings',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch security settings. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Fetch Failed', {
        description: errorMessage,
      });
    }
  }, [userRole]);

  const updateSecuritySettings = useCallback(async (data: Partial<SecuritySettings>): Promise<boolean> => {
    // Only admin can update security settings
    if (userRole !== 'admin') return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateSecuritySettings(data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          securitySettings: response.data!,
          isLoading: false,
        }));

        toast.success('Settings Updated', {
          description: 'Security settings have been updated successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update security settings. Please try again.';

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
  }, [userRole]);

  const fetchNotificationSettings = useCallback(async (): Promise<void> => {
    // Mock notification settings for teachers
    if (userRole === 'teacher') {
      setState(prev => ({
        ...prev,
        notificationSettings: {
          emailNotifications: true,
          documentShared: true,
          documentComments: false,
          weeklyDigest: true,
        },
      }));
    }
  }, [userRole]);

  const updateNotificationSettings = useCallback(async (data: Partial<NotificationSettings>): Promise<boolean> => {
    // Only teachers can update notification settings
    if (userRole !== 'teacher') return false;

    try {
      // Mock update for notification settings
      setState(prev => ({
        ...prev,
        notificationSettings: prev.notificationSettings 
          ? { ...prev.notificationSettings, ...data }
          : null,
      }));

      toast.success('Settings Updated', {
        description: 'Notification settings have been updated successfully.',
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update notification settings. Please try again.';

      toast.error('Update Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, [userRole]);

  const refresh = useCallback(() => {
    fetchSystemSettings();
    fetchSecuritySettings();
    fetchNotificationSettings();
  }, [fetchSystemSettings, fetchSecuritySettings, fetchNotificationSettings]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount and when userRole changes
  useEffect(() => {
    fetchSystemSettings();
    fetchSecuritySettings();
    fetchNotificationSettings();
  }, [fetchSystemSettings, fetchSecuritySettings, fetchNotificationSettings]);

  return {
    ...state,
    fetchSystemSettings,
    updateSystemSettings,
    fetchSecuritySettings,
    updateSecuritySettings,
    fetchNotificationSettings,
    updateNotificationSettings,
    refresh,
    clearError,
  };
};

export default useSettings;
