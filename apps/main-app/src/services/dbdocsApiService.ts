import httpClient from './httpClient';

export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  provider?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Documentation {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// API service class với automatic token refresh
export class DbdocsApiService {
  // User APIs
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/api/v1/users/me');
    return response.data;
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await httpClient.put<User>('/api/v1/users/me', userData);
    return response.data;
  }

  // Project APIs
  async getProjects(): Promise<Project[]> {
    const response = await httpClient.get<Project[]>('/api/v1/projects');
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await httpClient.get<Project>(`/api/v1/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await httpClient.post<Project>('/api/v1/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await httpClient.put<Project>(`/api/v1/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await httpClient.delete(`/api/v1/projects/${id}`);
  }

  // Documentation APIs
  async getDocumentations(projectId?: string): Promise<Documentation[]> {
    const url = projectId ? `/api/v1/documentations?projectId=${projectId}` : '/api/v1/documentations';
    const response = await httpClient.get<Documentation[]>(url);
    return response.data;
  }

  async getDocumentation(id: string): Promise<Documentation> {
    const response = await httpClient.get<Documentation>(`/api/v1/documentations/${id}`);
    return response.data;
  }

  async createDocumentation(docData: Omit<Documentation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Documentation> {
    const response = await httpClient.post<Documentation>('/api/v1/documentations', docData);
    return response.data;
  }

  async updateDocumentation(id: string, docData: Partial<Documentation>): Promise<Documentation> {
    const response = await httpClient.put<Documentation>(`/api/v1/documentations/${id}`, docData);
    return response.data;
  }

  async deleteDocumentation(id: string): Promise<void> {
    await httpClient.delete(`/api/v1/documentations/${id}`);
  }

  // Health check API
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await httpClient.get<{ status: string; timestamp: string }>('/api/v1/health');
    return response.data;
  }

  // Validate token API
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    const response = await httpClient.get<{ valid: boolean; user?: User }>('/api/auth/test');
    return response.data;
  }
}

// Export singleton instance
const dbdocsApiService = new DbdocsApiService();
export default dbdocsApiService; 