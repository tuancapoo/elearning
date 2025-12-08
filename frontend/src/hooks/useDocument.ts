import { useState } from 'react';
import { toast } from 'sonner';
import { documentService, Document, DocumentUploadData } from '../lib/documentService';

interface UseDocumentResult {
  documents: Document[];
  loading: boolean;
  fetchDocuments: (courseId: number) => Promise<Document[] | void>;
  downloadDocument: (courseId: number, documentId: number, fileName?: string) => Promise<boolean>;
  uploadDocument: (data: DocumentUploadData) => Promise<boolean>;
  deleteDocument: (courseId: number, documentId: number) => Promise<boolean>;
}

export function useDocument(): UseDocumentResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async (courseId: number) => {
    setLoading(true);
    try {
      const data = await documentService.getAllDocuments(courseId);
      setDocuments(data);
      return data;
    } catch (error: any) {
      toast.error('Tải tài liệu thất bại', {
        description: error?.message || 'Không thể tải danh sách tài liệu',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (
    courseId: number,
    documentId: number,
    fileName?: string
  ) => {
    try {
      const blob = await documentService.downloadDocument(courseId, documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Bắt đầu tải xuống');
      return true;
    } catch (error: any) {
      toast.error('Tải xuống thất bại', {
        description: error?.message || 'Không thể tải tài liệu',
      });
      return false;
    }
  };

  const uploadDocument = async (data: DocumentUploadData) => {
    setLoading(true);
    try {
      await documentService.uploadDocument(data);
      toast.success('Upload thành công');
      await fetchDocuments(data.courseId);
      return true;
    } catch (error: any) {
      toast.error('Upload thất bại', {
        description: error?.message || 'Không thể upload tài liệu',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (courseId: number, documentId: number) => {
    setLoading(true);
    try {
      await documentService.deleteDocument(courseId, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success('Đã xóa tài liệu');
      return true;
    } catch (error: any) {
      toast.error('Xóa thất bại', {
        description: error?.message || 'Không thể xóa tài liệu',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    downloadDocument,
    uploadDocument,
    deleteDocument,
  };
}
