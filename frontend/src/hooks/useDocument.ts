// src/hooks/useDocument.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentService, Document, DocumentUploadData } from '../lib/documentService';

/**
 * Hook to fetch all documents for a course
 */
export const useDocuments = (courseId: number) => {
  return useQuery({
    queryKey: ['documents', courseId],
    queryFn: () => documentService.getAllDocuments(courseId),
    enabled: !!courseId,
  });
};

/**
 * Hook to fetch document detail
 */
export const useDocumentDetail = (courseId: number, documentId: number) => {
  return useQuery({
    queryKey: ['document', courseId, documentId],
    queryFn: () => documentService.getDocumentDetail(courseId, documentId),
    enabled: !!courseId && !!documentId,
  });
};

/**
 * Hook to upload document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentUploadData) => documentService.uploadDocument(data),
    onSuccess: (_, variables) => {
      toast.success('Document Uploaded', {
        description: 'Document has been uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.courseId] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to upload document';
      toast.error('Upload Failed', {
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook to delete document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, documentId }: { courseId: number; documentId: number }) =>
      documentService.deleteDocument(courseId, documentId),
    onSuccess: (_, variables) => {
      toast.success('Document Deleted', {
        description: 'Document has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.courseId] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to delete document';
      toast.error('Delete Failed', {
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook to download document
 */
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: ({ courseId, documentId, fileName }: { courseId: number; documentId: number; fileName: string }) =>
      documentService.downloadDocument(courseId, documentId).then(blob => ({ blob, fileName })),
    onSuccess: ({ blob, fileName }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download Started', {
        description: 'Your document is being downloaded',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to download document';
      toast.error('Download Failed', {
        description: errorMessage,
      });
    },
  });
};

// Alias for compatibility
export const useDocument = useDocuments;
