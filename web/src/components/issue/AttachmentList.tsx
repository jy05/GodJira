import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentApi, Attachment } from '@/services/attachment.service';
import { formatDistanceToNow } from 'date-fns';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

interface AttachmentListProps {
  issueId: string;
}

export const AttachmentList = ({ issueId }: AttachmentListProps) => {
  const queryClient = useQueryClient();
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', issueId],
    queryFn: () => attachmentApi.getAttachments(issueId),
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', issueId] });
    },
  });

  const handleDownload = (attachment: Attachment) => {
    attachmentApi.downloadAttachment(attachment.id);
  };

  const handleDelete = (attachmentId: string) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      deleteMutation.mutate(attachmentId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype: string): JSX.Element => {
    if (mimetype.startsWith('image/')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (mimetype === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (
      mimetype.includes('word') ||
      mimetype.includes('document')
    ) {
      return (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
    if (
      mimetype.includes('excel') ||
      mimetype.includes('spreadsheet') ||
      mimetype === 'text/csv'
    ) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) {
      return (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      );
    }
    // Default file icon
    return (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        <p className="text-sm">No attachments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
      
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
        >
          {/* File Icon or Thumbnail - Clickable for preview */}
          <button
            onClick={() => setPreviewAttachment(attachment)}
            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            title="Click to preview"
          >
            {attachment.thumbnail ? (
              <img
                src={attachment.thumbnail}
                alt={attachment.filename}
                className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded border border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
                {getFileIcon(attachment.mimetype)}
              </div>
            )}
          </button>

          {/* File Info - Clickable for preview */}
          <button
            onClick={() => setPreviewAttachment(attachment)}
            className="flex-1 ml-3 min-w-0 text-left focus:outline-none"
          >
            <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
              {attachment.originalName || attachment.filename}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span>{formatFileSize(attachment.size)}</span>
              <span>•</span>
              <span>
                {attachment.uploader?.name || 'Unknown'} uploaded{' '}
                {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
              </span>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-3">
            <button
              onClick={() => handleDownload(attachment)}
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
              onClick={() => handleDelete(attachment.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
