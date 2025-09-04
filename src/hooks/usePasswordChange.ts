/**
 * Custom hook for password change functionality
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ChangePasswordRequest } from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface PasswordChangeState {
  isLoading: boolean;
  error: string | null;
}

interface PasswordChangeActions {
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  clearError: () => void;
}

export const usePasswordChange = (): PasswordChangeState & PasswordChangeActions => {
  const [state, setState] = useState<PasswordChangeState>({
    isLoading: false,
    error: null,
  });

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<boolean> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await apiClient.changePassword(data);
      
      if (response.success) {
        setState({ isLoading: false, error: null });

        toast.success('Password Changed', {
          description: response.data.message || 'Your password has been updated successfully.',
        });

        return true;
      }

      setState({ isLoading: false, error: 'Failed to change password' });
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to change password. Please try again.';

      setState({
        isLoading: false,
        error: errorMessage,
      });

      toast.error('Password Change Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    changePassword,
    clearError,
  };
};

export default usePasswordChange;
