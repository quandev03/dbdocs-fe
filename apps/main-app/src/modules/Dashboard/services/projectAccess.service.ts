import axios from 'axios';

export interface PermissionResponse {
  permissionLevel: number;
  code: number;
}

export enum PermissionLevel {
  OWNER = 3,  // Chủ sở hữu
  EDIT = 2,   // Quyền chỉnh sửa
  VIEW = 1,   // Quyền xem
  DENIED = 0  // Không có quyền
}

export const checkProjectPermission = async (projectId: string): Promise<PermissionResponse> => {
  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    
    const response = await axios.get(
      `http://localhost:8080/api/v1/project-access/permission-level/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
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