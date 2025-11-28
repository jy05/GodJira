import apiClient from '@/lib/api-client';

// Team types
export type TeamMemberRole = 'LEAD' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  projects?: TeamProject[];
  _count?: {
    members: number;
    projects: number;
  };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    jobTitle?: string;
    department?: string;
  };
}

export interface TeamProject {
  id: string;
  teamId: string;
  projectId: string;
  addedAt: string;
  project: {
    id: string;
    key: string;
    name: string;
    description?: string;
  };
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
  role?: TeamMemberRole;
}

export interface UpdateMemberRoleRequest {
  role: TeamMemberRole;
}

export interface AddProjectToTeamRequest {
  projectId: string;
}

export const teamApi = {
  // Create a new team
  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post<Team>('/teams', data);
    return response.data;
  },

  // Get all teams with optional pagination
  getTeams: async (params?: { skip?: number; take?: number }): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams', { params });
    return response.data;
  },

  // Get current user's teams
  getMyTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams/my-teams');
    return response.data;
  },

  // Get teams for a specific project
  getTeamsByProject: async (projectId: string): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>(`/teams/project/${projectId}`);
    return response.data;
  },

  // Get a single team by ID with members and projects
  getTeam: async (id: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${id}`);
    return response.data;
  },

  // Update team details
  updateTeam: async (id: string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await apiClient.patch<Team>(`/teams/${id}`, data);
    return response.data;
  },

  // Delete a team (does not delete users, only removes team associations)
  deleteTeam: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/teams/${id}`);
    return response.data;
  },

  // Add a member to a team
  addMember: async (
    teamId: string,
    data: AddTeamMemberRequest
  ): Promise<TeamMember> => {
    const response = await apiClient.post<TeamMember>(
      `/teams/${teamId}/members`,
      data
    );
    return response.data;
  },

  // Remove a member from a team (does not delete user account)
  removeMember: async (teamId: string, userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/teams/${teamId}/members/${userId}`
    );
    return response.data;
  },

  // Update a member's role in a team
  updateMemberRole: async (
    teamId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<TeamMember> => {
    const response = await apiClient.patch<TeamMember>(
      `/teams/${teamId}/members/${userId}/role`,
      data
    );
    return response.data;
  },

  // Add a project to a team
  addProject: async (
    teamId: string,
    data: AddProjectToTeamRequest
  ): Promise<TeamProject> => {
    const response = await apiClient.post<TeamProject>(
      `/teams/${teamId}/projects`,
      data
    );
    return response.data;
  },

  // Remove a project from a team
  removeProject: async (
    teamId: string,
    projectId: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/teams/${teamId}/projects/${projectId}`
    );
    return response.data;
  },
};

export default teamApi;
