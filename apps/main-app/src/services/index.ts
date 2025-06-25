import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { compact } from 'lodash';
import { safeApiClient } from './axios';
import authService from './authService';
import { userService } from './userService';
import { apiService } from './apiService';
import { menuItems } from '../routers/menu';
import { convertMenuItemToItem, getUrlsActive } from '@vissoft-react/common';
// import { requestFcmToken, revokeFcmToken } from './firebase';

// Import types from the main app
import { IUserInfo, MenuObjectItem } from '../modules/Layouts/types';

interface LoaderData {
  profile: IUserInfo;
  menus: any[];
  menuData: MenuObjectItem[];
}

export { authService, userService, apiService };

export const globalService = {
  async initApp(): Promise<LoaderData> {
    try {
      const profilePromise = globalService.getProfile();
      const menuPromise = globalService.getMenu();
      const [profile, menuData] = await Promise.all([
        profilePromise,
        menuPromise,
      ]);
      const menus: ItemType<MenuItemType>[] =
        globalService.mappingMenus(menuData);
      return { profile, menus, menuData };
    } catch {
      return {
        profile: {} as IUserInfo,
        menus: [],
        menuData: [],
      };
    }
  },
  // initFcm: async () => {
  //   try {
  //     const formReq = new URLSearchParams();
  //     let fcmToken = await requestFcmToken();
  //     formReq.set('token', fcmToken);
  //     const res = await safeApiClient.post<{ count: number }>(
  //       `/auth/fcm/init`,
  //       formReq,
  //       {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //       },
  //     );
  //     if (res.data.count === 0) {
  //       await revokeFcmToken();
  //       fcmToken = await requestFcmToken();
  //       formReq.set('token', fcmToken);
  //       await safeApiClient.post<{ count: number }>(`/auth/fcm/init`, formReq, {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //       });
  //     }
  //     if (fcmToken) {
  //       StorageService.setFcmToken(fcmToken);
  //     }
  //   } catch (e) {
  //     console.error('Error init FCM token', e);
  //   }
  // },
  getProfile: async () => {
    const res = await safeApiClient.get<IUserInfo>(`/auth/profile`);
    if (!res) throw new Error('Không thể lấy profile');
    return res.data;
  },
  getMenu: async () => {
    const res = await safeApiClient.get<MenuObjectItem[]>(`/auth/menu/flat`);
    if (!res) throw new Error('Không thể lấy menu');
    return res.data;
  },
  mappingMenus: (menuData: MenuObjectItem[]) => {
    const urlsActive = getUrlsActive(menuData);
    const menusClean = menuItems.filter(
      item => urlsActive?.includes(item.key) || item.hasChild === true,
    );
    const menus = compact(
      menusClean.map(item => convertMenuItemToItem(item, menusClean)),
    );
    return menus;
  },
};
