// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  role: UserRole;
  avatar?: string; // base64 data URL
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Error Response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Project types
export interface Project {
  id: string;
  key: string; // 2-10 uppercase letters
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  key: string;
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface ProjectStatistics {
  totalIssues: number;
  completedIssues: number;
  activeIssues: number;
  totalSprints: number;
  activeSprints: number;
  completedSprints: number;
}

// Sprint types
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  projectId: string;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  projectId: string;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface SprintStatistics {
  sprint: {
    id: string;
    name: string;
    status: SprintStatus;
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    todoIssues: number;
    completionRate: number;
  };
  storyPoints: {
    total: number;
    completed: number;
    remaining: number;
    completionRate: number;
  };
  breakdown: {
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface BurndownChart {
  sprintId: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  dataPoints: {
    date: string;
    idealRemaining: number;
    actualRemaining: number;
    completed: number;
  }[];
  summary: {
    totalStoryPoints: number;
    completedStoryPoints: number;
    remainingStoryPoints: number;
    completionRate: number;
  };
}

export interface VelocityReport {
  projectId: string;
  projectName: string;
  sprints: {
    sprintId: string;
    sprintName: string;
    committedPoints: number;
    completedPoints: number;
    completionRate: number;
  }[];
  averageVelocity: number;
  averageCommitmentAccuracy: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  totalSprints: number;
}

