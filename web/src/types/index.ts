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
  timezone?: string; // IANA timezone identifier
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

// ===========================
// ISSUE TYPES (Phase 4)
// ===========================

export type IssueType = 'TASK' | 'BUG' | 'STORY' | 'EPIC' | 'SPIKE';

export type IssueStatus =
  | 'UNASSIGNED'
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'BLOCKED'
  | 'DONE'
  | 'CLOSED';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';

export interface Issue {
  id: string;
  key: string; // e.g., "WEB-123"
  title: string;
  description: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints: number | null;
  labels: string[];
  projectId: string;
  project?: {
    id: string;
    key: string;
    name: string;
  };
  sprintId: string | null;
  sprint?: {
    id: string;
    name: string;
    status: SprintStatus;
  };
  creatorId: string;
  creator?: User;
  assigneeId: string | null;
  assignee?: User | null;
  parentIssueId: string | null;
  parentIssue?: Issue | null;
  subIssues?: Issue[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    subIssues: number;
    watchers: number;
  };
}

export interface CreateIssueRequest {
  title: string;
  description?: string;
  type: IssueType;
  priority?: IssuePriority;
  storyPoints?: number;
  labels?: string[];
  projectId: string;
  sprintId?: string | null;
  assigneeId?: string | null;
  parentIssueId?: string | null;
}

export interface UpdateIssueRequest {
  key?: string;
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  storyPoints?: number;
  labels?: string[];
  sprintId?: string | null;
  assigneeId?: string | null;
}

export interface IssueFilters {
  skip?: number;
  take?: number;
  projectId?: string;
  sprintId?: string | null;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assigneeId?: string;
  creatorId?: string;
  search?: string;
}


