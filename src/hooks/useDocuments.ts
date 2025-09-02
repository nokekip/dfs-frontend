/**
 * Custom hook for document management operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Document, 
  DocumentStatus,
  DocumentCreateRequest, 
  DocumentUpdateRequest, 
  DocumentShareRequest,
  SearchFilters
} from '../services/types';
import { apiClient, ApiError } from '../services/api';

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
}

interface DocumentsActions {
  fetchDocuments: (filters?: SearchFilters) => Promise<void>;
  uploadDocument: (data: DocumentCreateRequest) => Promise<boolean>;
  updateDocument: (documentId: string, data: DocumentUpdateRequest) => Promise<boolean>;
  shareDocument: (documentId: string, isShared: boolean) => Promise<boolean>;
  revokeShare: (documentId: string) => Promise<boolean>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  downloadDocument: (documentId: string) => Promise<boolean>;
  flagDocument: (documentId: string) => Promise<boolean>;
  archiveDocument: (documentId: string) => Promise<boolean>;
  refresh: () => void;
  clearError: () => void;
}

export const useDocuments = (initialFilters?: SearchFilters): DocumentsState & DocumentsActions => {
  const [state, setState] = useState<DocumentsState>({
    documents: [],
    isLoading: false,
    isUploading: false,
    error: null,
  });

  const [currentFilters, setCurrentFilters] = useState<SearchFilters | undefined>(initialFilters);

  const fetchDocuments = useCallback(async (filters?: SearchFilters): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Update current filters if provided
    if (filters !== undefined) {
      setCurrentFilters(filters);
    }

    try {
      const response = await apiClient.getDocuments(filters || currentFilters);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          documents: response.data!,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch documents',
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to fetch documents. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Fetch Failed', {
        description: errorMessage,
      });
    }
  }, [currentFilters]);

  const uploadDocument = useCallback(async (data: DocumentCreateRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      const response = await apiClient.createDocument(data);
      
      if (response.success && response.data) {
        // Add the new document to the local state
        setState(prev => ({
          ...prev,
          documents: [response.data!, ...prev.documents],
          isUploading: false,
        }));

        toast.success('Document Uploaded', {
          description: `"${response.data.title}" has been uploaded successfully.`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isUploading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to upload document. Please try again.';

      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));

      toast.error('Upload Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const updateDocument = useCallback(async (
    documentId: string, 
    data: DocumentUpdateRequest
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.updateDocument(documentId, data);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId ? response.data! : doc
          ),
          isLoading: false,
        }));

        toast.success('Document Updated', {
          description: 'Document has been updated successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update document. Please try again.';

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

  const shareDocument = useCallback(async (
    documentId: string, 
    isShared: boolean
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data: DocumentShareRequest = { isShared };
      const response = await apiClient.shareDocument(documentId, data);
      
      if (response.success && response.data) {
        // Update the document in the local state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId ? response.data! : doc
          ),
          isLoading: false,
        }));

        toast.success(
          isShared ? 'Document Shared' : 'Document Unshared',
          {
            description: isShared 
              ? 'Document is now publicly accessible.'
              : 'Document is now private.',
          }
        );

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : `Failed to ${isShared ? 'share' : 'unshare'} document. Please try again.`;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(
        isShared ? 'Share Failed' : 'Unshare Failed',
        {
          description: errorMessage,
        }
      );

      return false;
    }
  }, []);

  const revokeShare = useCallback(async (documentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Set the document to not shared and clear shared users
      const data: DocumentShareRequest = { isShared: false };
      const response = await apiClient.shareDocument(documentId, data);
      
      if (response.success && response.data) {
        // Update the document in the local state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId 
              ? { ...response.data!, sharedWith: [] } // Clear shared users
              : doc
          ),
          isLoading: false,
        }));

        toast.success('Sharing Revoked', {
          description: 'Document sharing has been stopped successfully.',
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to revoke sharing. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Revoke Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const documentToDelete = state.documents.find(doc => doc.id === documentId);
      const response = await apiClient.deleteDocument(documentId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.filter(doc => doc.id !== documentId),
          isLoading: false,
        }));

        toast.success('Document Deleted', {
          description: `"${documentToDelete?.title}" has been deleted successfully.`,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete document. Please try again.';

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
  }, [state.documents]);

  const downloadDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      // Note: This would be implemented when we add the download document endpoint
      // For now, we'll simulate the download and update download count
      
      const document = state.documents.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Download Failed', {
          description: 'Document not found.',
        });
        return false;
      }

      // Update download count locally
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === documentId 
            ? { ...doc, downloadCount: doc.downloadCount + 1 }
            : doc
        ),
      }));

      toast.success('Download Started', {
        description: `Downloading "${document.title}"...`,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to download document. Please try again.';

      toast.error('Download Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, [state.documents]);

  const flagDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.flagDocument(documentId);
      
      if (response.success && response.data) {
        // Update the document status in local state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: response.data!.document_status as DocumentStatus }
              : doc
          ),
          isLoading: false,
        }));

        toast.success('Document Status Updated', {
          description: response.message,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update document status. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Action Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const archiveDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.archiveDocument(documentId);
      
      if (response.success && response.data) {
        // Update the document status in local state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: response.data!.document_status as DocumentStatus }
              : doc
          ),
          isLoading: false,
        }));

        toast.success('Document Status Updated', {
          description: response.message,
        });

        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update document status. Please try again.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Action Failed', {
        description: errorMessage,
      });

      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    ...state,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    shareDocument,
    revokeShare,
    deleteDocument,
    downloadDocument,
    flagDocument,
    archiveDocument,
    refresh,
    clearError,
  };
};

export default useDocuments;
