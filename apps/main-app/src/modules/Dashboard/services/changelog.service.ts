import axios from 'axios';

export interface Changelog {
  id: string;
  projectId: string;
  content: string;
  codeChangeLog: string;
  createdDate: string;
  lastModifiedDate: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface VersionInfo {
  id: string;
  projectId: string;
  codeVersion: number;
  changeLogId: string;
  diffChange: string | null;
  changeLog: {
    changeLogId: string | null;
    projectId: string;
    content: string;
    codeChangeLog: string;
    createdDate: number;
    createdBy: string | null;
    modifiedDate: number;
    modifiedBy: string | null;
  };
  content: string;
  createdDate: number;
  createdBy: string;
}

export interface CreateVersionResponse {
  id: string;
  projectId: string;
  codeVersion: number;
  changeLogId: string;
  diffChange: string;
  changeLog: {
    changeLogId: string;
    projectId: string;
    content: string;
    codeChangeLog: string;
    createdDate: string;
    createdBy: string;
    modifiedDate: string;
    modifiedBy: string;
    creatorName: string;
    creatorAvatarUrl: string;
    modifierName: string;
    modifierAvatarUrl: string;
  };
  content: string;
  createdDate: string;
  createdBy: string;
}

/**
 * Lấy changelog mới nhất cho một dự án
 * @param projectId ID của dự án
 * @returns Changelog mới nhất hoặc null nếu không có
 */
export const getLatestChangelog = async (projectId: string): Promise<Changelog | null> => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(
      `${import.meta.env.VITE_API_DOMAIN}/api/v1/changelogs/latest/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Nếu status là 204 (No Content), trả về null
    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching latest changelog:', error);
    return null;
  }
};

/**
 * Lấy danh sách phiên bản cho một dự án
 * @param projectId ID của dự án
 * @returns Danh sách phiên bản hoặc mảng rỗng nếu không có
 */
export const getProjectVersions = async (projectId: string): Promise<VersionInfo[]> => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(
      `${import.meta.env.VITE_API_DOMAIN}/api/v1/versions/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('Error fetching project versions:', error);
    return [];
  }
};

/**
 * Lấy nội dung DBML cho một phiên bản cụ thể
 * @param projectId ID của dự án
 * @param versionId ID của phiên bản
 * @returns Nội dung DBML hoặc null nếu không có
 */
export const getVersionContent = async (projectId: string, versionId: string): Promise<string | null> => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(
      `${import.meta.env.VITE_API_DOMAIN}/api/v1/changelogs/project/${projectId}/version/${versionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Nếu status là 204 (No Content), trả về null
    if (response.status === 204) {
      return null;
    }

    return response.data.content;
  } catch (error) {
    console.error(`Error fetching content for version ${versionId}:`, error);
    return null;
  }
};
