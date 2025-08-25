/**
 * Custom hook for dashboard statistics operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  DashboardStats, 
  TeacherDashboardStats,
  ActivityLog
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface DashboardState {
  stats: DashboardStats | TeacherDashboardStats | null;
  activityLogs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  fetchDashboardStats: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;
  refresh: () => void;
  clearError: () => void;
}

export const useDashboard = (userRole: 'admin' | 'teacher'): DashboardState & DashboardActions => {
  const [state, setState] = useState<DashboardState>({
    stats: null,
    activityLogs: [],
    isLoading: false,
    error: null,
  });

  const fetchDashboardStats = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let response;
      
      if (userRole === 'admin') {
        response = await apiClient.getDashboardStats();
      } else {
        response = await apiClient.getTeacherDashboardStats();
      }
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          stats: response.data!,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch dashboard statistics',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch dashboard statistics. Please try again.';

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

  const fetchActivityLogs = useCallback(async (): Promise<void> => {
    // Only admin can fetch activity logs
    if (userRole !== 'admin') return;

    try {
      const response = await apiClient.getActivityLogs();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          activityLogs: response.data!,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch activity logs.';

      console.error('Activity logs fetch error:', errorMessage);
      // Don't show toast for activity logs error as it's not critical
    }
  }, [userRole]);

  const refresh = useCallback(() => {
    fetchDashboardStats();
    fetchActivityLogs();
  }, [fetchDashboardStats, fetchActivityLogs]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount and when userRole changes
  useEffect(() => {
    fetchDashboardStats();
    fetchActivityLogs();
  }, [fetchDashboardStats, fetchActivityLogs]);

  return {
    ...state,
    fetchDashboardStats,
    fetchActivityLogs,
    refresh,
    clearError,
  };
};

export default useDashboard;
