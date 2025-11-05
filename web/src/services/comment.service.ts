import apiClient from '@/lib/api-client';

export interface Comment {
  id: string;
  content: string;
  issueId?: string;
  taskId?: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  issueId?: string;
  taskId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export const commentApi = {
  // Create a new comment
  createComment: async (data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },

  // Get all comments for an issue
  getIssueComments: async (issueId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/issue/${issueId}`);
    return response.data;
  },

  // Get all comments for a task
  getTaskComments: async (taskId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/task/${taskId}`);
    return response.data;
  },

  // Get a single comment
  getComment: async (id: string): Promise<Comment> => {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  },

  // Update a comment
  updateComment: async (id: string, data: UpdateCommentDto): Promise<Comment> => {
    const response = await apiClient.patch(`/comments/${id}`, data);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};
