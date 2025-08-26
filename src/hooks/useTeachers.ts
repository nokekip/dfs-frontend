/**
 * Custom hook for teacher management operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Teacher, 
  TeacherCreateRequest, 
  TeacherUpdateRequest, 
  TeacherApprovalRequest
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface TeachersState {
  teachers: Teacher[];
  isLoading: boolean;
  error: string | null;
}

interface TeachersActions {
  fetchTeachers: () => Promise<void>;
  addTeacher: (data: TeacherCreateRequest) => Promise<boolean>;
  deleteTeacher: (teacherId: string) => Promise<boolean>;
  approveTeacher: (teacherId: string, approved: boolean, rejectionReason?: string) => Promise<boolean>;
  updateTeacher: (teacherId: string, data: TeacherUpdateRequest) => Promise<boolean>;
  refresh: () => void;
  clearError: () => void;
}

export const useTeachers = (): TeachersState & TeachersActions => {
  const [state, setState] = useState<TeachersState>({
    teachers: [],
    isLoading: false,
    error: null,
  });

  const fetchTeachers = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getTeachers();
      
      if (response.success && response.data) {
        setState({
          teachers: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch teachers',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch teachers. Please try again.';

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

  const addTeacher = useCallback(async (
    data: TeacherCreateRequest
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.createTeacher(data);
      
      if (response.success && response.data) {
        // Add the new teacher to the local state
        setState(prev => {
          const updatedTeachers = [...prev.teachers, response.data!];
          return {
            ...prev,
            teachers: updatedTeachers,
            isLoading: false,
          };
        });

        toast.success('Teacher Added', {
          description: `${response.data.user.firstName} ${response.data.user.lastName} has been added successfully.`,
        });

        // Also refresh the data to ensure consistency
        fetchTeachers();

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to add teacher. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Add Teacher Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const deleteTeacher = useCallback(async (
    teacherId: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.deleteTeacher(teacherId);
      
      if (response.success) {
        // Remove the teacher from the local state
        setState(prev => ({
          ...prev,
          teachers: prev.teachers.filter(teacher => teacher.id !== teacherId),
          isLoading: false,
        }));

        toast.success('Teacher Deleted', {
          description: 'Teacher account has been permanently deleted.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete teacher. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Delete Teacher Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const approveTeacher = useCallback(async (
    teacherId: string, 
    approved: boolean, 
    rejectionReason?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data: TeacherApprovalRequest = { 
        approved, 
        rejectionReason: approved ? undefined : rejectionReason 
      };

      const response = await apiClient.approveTeacher(teacherId, data);
      
      if (response.success && response.data) {
        // Update the teacher in the local state
        setState(prev => ({
          ...prev,
          teachers: prev.teachers.map(teacher => 
            teacher.id === teacherId ? response.data! : teacher
          ),
          isLoading: false,
        }));

        toast.success(
          approved ? 'Teacher Approved' : 'Teacher Rejected',
          {
            description: approved 
              ? `${response.data.user.firstName} ${response.data.user.lastName} has been approved successfully.`
              : `${response.data.user.firstName} ${response.data.user.lastName} has been rejected.`,
          }
        );

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : `Failed to ${approved ? 'approve' : 'reject'} teacher. Please try again.`;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(
        approved ? 'Approval Failed' : 'Rejection Failed',
        {
          description: errorMessage,
        }
      );

      return false;
    }
  }, []);

  const updateTeacher = useCallback(async (
    teacherId: string, 
    data: TeacherUpdateRequest
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateTeacher(teacherId, data);
      
      if (response.success && response.data) {
        // Update the teacher in the local state
        setState(prev => ({
          ...prev,
          teachers: prev.teachers.map(teacher => 
            teacher.id === teacherId ? response.data! : teacher
          ),
          isLoading: false,
        }));

        toast.success('Teacher Updated', {
          description: 'Teacher information has been updated successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update teacher. Please try again.';

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

  const refresh = useCallback(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    ...state,
    fetchTeachers,
    addTeacher,
    deleteTeacher,
    approveTeacher,
    updateTeacher,
    refresh,
    clearError,
  };
};

export default useTeachers;
