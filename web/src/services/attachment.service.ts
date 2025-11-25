import apiClient from '../lib/api-client';

export interface Attachment {
  id: string;
  issueId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  data: string; // Base64 encoded
  thumbnail?: string | null;
  uploadedBy: string;
  uploader?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
}

export interface UploadAttachmentResponse {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  thumbnail?: string | null;
}

export const attachmentApi = {
  /**
   * Upload an attachment to an issue
   * @param issueId - The ID of the issue
   * @param file - The file to upload (max 20MB)
   */
  uploadAttachment: async (
    issueId: string,
    file: File
  ): Promise<UploadAttachmentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadAttachmentResponse>(
      `/attachments/issues/${issueId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get all attachments for an issue
   * @param issueId - The ID of the issue
   */
  getAttachments: async (issueId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<Attachment[]>(
      `/attachments/issues/${issueId}`
    );
    return response.data;
  },

  /**
   * Get a specific attachment
   * @param attachmentId - The ID of the attachment
   */
  getAttachment: async (attachmentId: string): Promise<Attachment> => {
    const response = await apiClient.get<Attachment>(
      `/attachments/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Download an attachment (decode base64 and trigger download)
   * @param attachmentId - The ID of the attachment
   */
  downloadAttachment: async (attachmentId: string): Promise<void> => {
    const attachment = await attachmentApi.getAttachment(attachmentId);
    
    // Convert base64 to blob
    const base64Data = attachment.data.split(',')[1]; // Remove data:mime;base64, prefix
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: attachment.mimetype });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.originalName || attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Delete an attachment
   * @param attachmentId - The ID of the attachment
   */
  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};
