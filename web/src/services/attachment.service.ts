import apiClient from '../lib/api-client';

export interface Attachment {
  id: string;
  issueId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface UploadAttachmentResponse {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
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
      `/issues/${issueId}/attachments`,
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
      `/issues/${issueId}/attachments`
    );
    return response.data;
  },

  /**
   * Get a specific attachment
   * @param issueId - The ID of the issue
   * @param attachmentId - The ID of the attachment
   */
  getAttachment: async (
    issueId: string,
    attachmentId: string
  ): Promise<Attachment> => {
    const response = await apiClient.get<Attachment>(
      `/issues/${issueId}/attachments/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Download an attachment
   * @param issueId - The ID of the issue
   * @param attachmentId - The ID of the attachment
   * @param fileName - The name of the file (for download)
   */
  downloadAttachment: (
    issueId: string,
    attachmentId: string,
    fileName: string
  ): void => {
    const url = `${apiClient.defaults.baseURL}/issues/${issueId}/attachments/${attachmentId}/download`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Delete an attachment
   * @param issueId - The ID of the issue
   * @param attachmentId - The ID of the attachment
   */
  deleteAttachment: async (
    issueId: string,
    attachmentId: string
  ): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/attachments/${attachmentId}`);
  },
};
