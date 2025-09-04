/**
 * Custom hook for user preferences management
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserPreferences, ProfileResponse } from '../services/types';
import { apiClient, ApiError } from '../services/api';
import { useAuth } from './useAuth';

interface UserPreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

interface UserPreferencesActions {
  updatePreferences: (data: Partial<UserPreferences>) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
  clearError: () => void;
}

export const useUserPreferences = (): UserPreferencesState & UserPreferencesActions => {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<UserPreferencesState>({
    preferences: null,
    isLoading: false,
    error: null,
  });

  // Load preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    } else {
      setState({
        preferences: null,
        isLoading: false,
        error: null,
      });
    }
  }, [isAuthenticated]);

  const loadPreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getProfile();
      
      if (response.success && response.data) {
        setState({
          preferences: response.data.preferences,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load preferences',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load preferences';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateProfile({
        preferences: data
      });
      
      if (response.success && response.data) {
        setState({
          preferences: response.data.preferences,
          isLoading: false,
          error: null,
        });

        toast.success('Preferences Updated', {
          description: 'Your preferences have been saved successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update preferences';

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
  }, []);

  const refreshPreferences = useCallback(async (): Promise<void> => {
    await loadPreferences();
  }, [loadPreferences]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updatePreferences,
    refreshPreferences,
    clearError,
  };
};

export default useUserPreferences;
