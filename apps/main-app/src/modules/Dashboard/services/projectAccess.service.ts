import httpClient from '../../../services/httpClient';
import { API_CONFIG } from '../../../config';
import authService from '../../../services/authService';

export interface PermissionResponse {
  permissionLevel: number;
  code: number;
}

export enum PermissionLevel {
  OWNER = 1,  // Chủ sở hữu
  VIEW = 2,   // Quyền xem
  EDIT = 3,   // Quyền chỉnh sửa
  DENIED = 4  // Không có quyền
}

export const checkProjectPermission = async (projectId: string): Promise<PermissionResponse> => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log('❌ User not authenticated for project permission check');
      return { permissionLevel: PermissionLevel.DENIED, code: PermissionLevel.DENIED };
    }

    const authHeader = authService.getAuthorizationHeader();
    if (!authHeader) {
      console.log('❌ No authorization header available');
      return { permissionLevel: PermissionLevel.DENIED, code: PermissionLevel.DENIED };
    }

    const response = await httpClient.get(
      `/api/v1/project-access/permission-level/${projectId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error checking project permission:', error);
    // Trả về quyền bị từ chối nếu có lỗi
    return { permissionLevel: PermissionLevel.DENIED, code: PermissionLevel.DENIED };
  }
};

export const getPermissionText = (permissionLevel: number): string => {
  switch (permissionLevel) {
    case PermissionLevel.OWNER:
      return 'Bạn là chủ sở hữu dự án này';
    case PermissionLevel.EDIT:
      return 'Bạn có quyền chỉnh sửa dự án này';
    case PermissionLevel.VIEW:
      return 'Bạn chỉ có quyền xem dự án này';
    case PermissionLevel.DENIED:
    default:
      return 'Bạn không có quyền truy cập dự án này';
  }
};
