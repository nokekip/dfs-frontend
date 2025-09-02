/**
 * Custom hook for category management operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  DocumentCategory, 
  CategoryCreateRequest, 
  CategoryUpdateRequest
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface CategoriesState {
  categories: DocumentCategory[];
  isLoading: boolean;
  error: string | null;
}

interface CategoriesActions {
  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryCreateRequest) => Promise<boolean>;
  updateCategory: (categoryId: string, data: CategoryUpdateRequest) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  toggleCategoryStatus: (categoryId: string, isActive: boolean) => Promise<boolean>;
  refresh: () => void;
  clearError: () => void;
}

export const useCategories = (): CategoriesState & CategoriesActions => {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    isLoading: false,
    error: null,
  });

  const fetchCategories = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getCategories();
      
      if (response.success && response.data) {
        setState({
          categories: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch categories',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch categories. Please try again.';

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

  const createCategory = useCallback(async (data: CategoryCreateRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.createCategory(data);
      
      if (response.success && response.data) {
        // Add the new category to the local state
        setState(prev => ({
          ...prev,
          categories: [...prev.categories, response.data!],
          isLoading: false,
        }));

        toast.success('Category Created', {
          description: `"${response.data.name}" has been created successfully.`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to create category. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Creation Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const updateCategory = useCallback(async (
    categoryId: string, 
    data: CategoryUpdateRequest
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateCategory(categoryId, data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat => 
            cat.id === categoryId ? response.data! : cat
          ),
          isLoading: false,
        }));

        toast.success('Category Updated', {
          description: response.message,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update category. Please try again.';

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

  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.deleteCategory(categoryId);
      
      if (response.success) {
        const categoryToDelete = state.categories.find(cat => cat.id === categoryId);
        
        // Remove the category from the local state
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat.id !== categoryId),
          isLoading: false,
        }));

        toast.success('Category Deleted', {
          description: `"${categoryToDelete?.name}" has been deleted successfully.`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete category. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Delete Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, [state.categories]);

  const toggleCategoryStatus = useCallback(async (
    categoryId: string, 
    isActive: boolean
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.toggleCategoryActive(categoryId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat => 
            cat.id === categoryId ? response.data! : cat
          ),
          isLoading: false,
        }));

        toast.success(
          response.data.isActive ? 'Category Activated' : 'Category Deactivated',
          {
            description: response.message,
          }
        );

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : `Failed to ${isActive ? 'activate' : 'deactivate'} category. Please try again.`;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(
        isActive ? 'Activation Failed' : 'Deactivation Failed',
        {
          description: errorMessage,
        }
      );

      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refresh,
    clearError,
  };
};

export default useCategories;
