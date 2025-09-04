/**
 * Custom hook for document shares management
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentShare, Document } from '../services/types';
import { apiClient, ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ShareWithDocument extends DocumentShare {
  documentDetails?: Document;
}

interface DocumentSharesState {
  shares: ShareWithDocument[];
  sharedWithMe: ShareWithDocument[];
  mySharedFiles: ShareWithDocument[];
  isLoading: boolean;
  error: string | null;
}

interface DocumentSharesActions {
  fetchShares: () => Promise<void>;
  refresh: () => void;
  clearError: () => void;
}

export const useDocumentShares = (): DocumentSharesState & DocumentSharesActions => {
  const { user } = useAuth();
  const [state, setState] = useState<DocumentSharesState>({
    shares: [],
    sharedWithMe: [],
    mySharedFiles: [],
    isLoading: false,
    error: null,
  });

  const fetchShares = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getDocumentShares();
      
      if (response.success && response.data) {
        const shares = response.data;
        
        // Convert shares to include document details from the backend data
        const sharesWithDocuments: ShareWithDocument[] = shares.map((share) => {
          // Create document object from the share's document fields
          const documentDetails: Document = {
            id: share.document,
            title: share.document_title || 'Untitled Document',
            description: share.document_description || '',
            fileName: share.document_file_name || 'document',
            fileSize: share.document_file_size || 0,
            fileType: share.document_file_type || 'unknown',
            filePath: '',
            category: {
              id: share.document_category_id || '',
              name: share.document_category_name || 'Uncategorized',
              description: '',
              requiresClassSubject: false,
              isActive: true,
              documentsCount: 0,
              createdAt: '',
              updatedAt: '',
            },
            teacher: {
              id: share.shared_by,
              user: {
                id: share.shared_by,
                email: '',
                firstName: share.shared_by_name?.split(' ')[0] || 'Unknown',
                lastName: share.shared_by_name?.split(' ').slice(1).join(' ') || '',
                role: 'teacher',
                isActive: true,
                dateJoined: '',
              },
              status: 'active',
              documentsCount: 0,
              sharedDocumentsCount: 0,
              totalDownloads: 0,
              createdAt: '',
              updatedAt: '',
            },
            classLevel: share.document_class_level || '',
            subject: share.document_subject || '',
            isShared: true,
            sharedAt: share.shared_at,
            downloadCount: share.document_download_count || 0,
            status: (share.document_status as any) || 'active',
            sharedWith: [],
            tags: [],
            createdAt: share.document_created_at || share.shared_at,
            updatedAt: share.document_created_at || share.shared_at,
            // Include the public share URL if this is a public share
            public_share_url: share.share_type === 'public' ? share.public_url : undefined,
            shared_with_emails: [], // This would need to be populated from a separate API call if needed
          };
          
          return {
            ...share,
            documentDetails,
          };
        });

        // Separate shares into categories with simplified filtering
        // Backend already filters to only return shares for this user's teacher profile
        const sharedWithMe = sharesWithDocuments.filter(share => {
          // Shares where this user is the recipient (private shares only)
          const isRecipient = share.shared_with && share.is_active && share.share_type === 'private';
          return isRecipient;
        });
        
        const mySharedFiles = sharesWithDocuments.filter(share => {
          // Shares where this user is the creator
          const isCreator = share.shared_by && share.is_active;
          return isCreator;
        });

        setState(prev => ({
          ...prev,
          shares: sharesWithDocuments,
          sharedWithMe,
          mySharedFiles,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch document shares',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch document shares. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Fetch Failed', {
        description: errorMessage,
      });
    }
  }, [user?.id]);

  const refresh = useCallback(() => {
    fetchShares();
  }, [fetchShares]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (user) {
      fetchShares();
    }
  }, [fetchShares, user]);

  return {
    ...state,
    fetchShares,
    refresh,
    clearError,
  };
};

export default useDocumentShares;
