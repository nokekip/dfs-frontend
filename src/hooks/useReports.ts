/**
 * Custom hook for reports operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ReportsData } from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface ReportsState {
  data: ReportsData | null;
  isLoading: boolean;
  error: string | null;
}

interface ReportsActions {
  fetchReports: (timeRange?: string) => Promise<void>;
  refresh: () => void;
  clearError: () => void;
}

export const useReports = (): ReportsState & ReportsActions => {
  const [state, setState] = useState<ReportsState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchReports = useCallback(async (timeRange: string = '30'): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getReportsData(timeRange);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data!,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch reports data',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch reports data. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Fetch Failed', {
        description: errorMessage,
      });
    }
  }, []);

  const refresh = useCallback(() => {
    const currentTimeRange = '30'; // Default, could be enhanced to remember last used
    fetchReports(currentTimeRange);
  }, [fetchReports]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    fetchReports,
    refresh,
    clearError,
  };
};
