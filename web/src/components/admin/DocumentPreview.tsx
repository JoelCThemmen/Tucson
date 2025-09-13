import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { X, Download, FileText, Image, AlertCircle } from 'lucide-react';

interface DocumentPreviewProps {
  verificationId: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  verificationId,
  documentId,
  fileName,
  mimeType,
  onClose,
}) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
    
    return () => {
      // Clean up the blob URL when component unmounts
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [verificationId, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await adminService.getVerificationDocument(verificationId, documentId);
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
    } catch (err: any) {
      console.error('Error loading document:', err);
      setError(err.response?.data?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      const a = document.createElement('a');
      a.href = documentUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getFileIcon = () => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="text-lg font-semibold">{fileName}</h3>
              <p className="text-sm text-gray-500">{mimeType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-96">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-600">{error}</p>
              <button
                onClick={loadDocument}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && documentUrl && (
            <div className="w-full h-full">
              {mimeType === 'application/pdf' ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-[75vh] border rounded-lg"
                  title={fileName}
                />
              ) : mimeType.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img
                    src={documentUrl}
                    alt={fileName}
                    className="max-w-full max-h-[75vh] rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;