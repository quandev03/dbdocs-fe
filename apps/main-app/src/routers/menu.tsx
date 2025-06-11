import { House, Settings } from 'lucide-react';
import { MenuItem } from '../modules/Layouts/types';
import { pathRoutes } from './url';

export const menuItems: MenuItem[] = [
  {
    key: pathRoutes.home,
    icon: <House />,
    label: 'Tổng quan',
  },
  {
    key: pathRoutes.accountAuthorization,
    icon: <Settings />,
    label: 'Quản Trị Hệ Thống',
    hasChild: true,
  },
  {
    key: pathRoutes.roleManager,
    label: 'Vai trò & Phân quyền',
    parentId: pathRoutes.accountAuthorization,
  },
  {
    key: pathRoutes.systemUserManager,
    label: 'Quản lý người dùng hệ thống',
    parentId: pathRoutes.accountAuthorization,
  },
];
