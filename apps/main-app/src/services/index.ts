import { LoaderData } from '@/hooks/useLoaderData';
import { IUserInfo, MenuObjectItem } from '@/modules/Layouts/types';
import { menuItems } from '@/routers/menu';
import { convertMenuItemToItem } from '@/utils';
import { getUrlsActive } from '@/utils/utils';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { compact } from 'lodash';
import { safeApiClient } from './axios';
// import { requestFcmToken, revokeFcmToken } from './firebase';

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
