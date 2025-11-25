import { useEffect } from 'react';
import { Attachment } from '@/services/attachment.service';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const AttachmentPreviewModal = ({ attachment, onClose }: AttachmentPreviewModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!attachment) return null;

  const isImage = attachment.mimetype.startsWith('image/');
  const isPDF = attachment.mimetype === 'application/pdf';
  const isVideo = attachment.mimetype.startsWith('video/');
  const isAudio = attachment.mimetype.startsWith('audio/');
  const isText = attachment.mimetype.startsWith('text/') || 
                 attachment.mimetype === 'application/json' ||
                 attachment.mimetype === 'application/xml';
  
  const canPreview = isImage || isPDF || isVideo || isAudio || isText;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.originalName || attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {attachment.originalName || attachment.filename}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>{formatFileSize(attachment.size)}</span>
              <span>•</span>
              <span>{attachment.mimetype}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-900">
          {canPreview ? (
            <div className="h-full flex items-center justify-center">
              {isImage && (
                <img
                  src={attachment.data}
                  alt={attachment.filename}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              
              {isPDF && (
                <div className="w-full h-full min-h-[70vh] flex flex-col">
                  <object
                    data={attachment.data}
                    type="application/pdf"
                    className="w-full h-full flex-1"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8">
                      <svg className="w-24 h-24 mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-700 mb-2">PDF Preview Unavailable</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Your browser cannot display this PDF inline
                      </p>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Download PDF to View
                      </button>
                    </div>
                  </object>
                </div>
              )}
              
              {isVideo && (
                <video
                  src={attachment.data}
                  controls
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {isAudio && (
                <div className="w-full max-w-2xl">
                  <audio
                    src={attachment.data}
                    controls
                    className="w-full"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}
              
              {isText && (
                <div className="w-full h-full bg-white p-6 rounded overflow-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {/* Decode base64 text content */}
                    {(() => {
                      try {
                        const base64Data = attachment.data.split(',')[1];
                        return atob(base64Data);
                      } catch {
                        return 'Unable to preview text content';
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white">
              <svg className="w-24 h-24 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-300 mb-2">Preview not available</p>
              <p className="text-sm text-gray-400 mb-4">
                This file type cannot be previewed in the browser
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer with metadata */}
        {attachment.uploader && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
            Uploaded by <span className="font-medium">{attachment.uploader.name}</span> on{' '}
            {new Date(attachment.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
