import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultParams } from '../constants';
import { LayoutService } from '../services';
import {
  DataNotify,
  IUserInfo,
  MenuObjectItem,
  ParamsOptionType,
} from '../types';
import { StorageService } from '@vissoft-react/common';
import {
  ACCESS_TOKEN_KEY,
  FCM_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USERNAME,
  STORAGE_KEY_PREFIX,
  APP_CODE,
} from '../../../constants';
export interface IConfigAppStore {
  collapsedMenu: boolean;
  showNotify: boolean;
  isAuthenticated: boolean;
  showChangePassModal: boolean;
  dataNotify: DataNotify;
  userLogin: IUserInfo | null;
  openChangePassword: boolean;
  menuData: MenuObjectItem[];
  params: ParamsOptionType;
  urlsActive: string[];
  setUrlsActive: (urlsActive: string[]) => void;
  setMenuData: (menuData: MenuObjectItem[]) => void;
  setParams: (params: ParamsOptionType) => void;
  setOpenChangePassword: (openChangePassword: boolean) => void;
  setUserLogin: (userLogin: IUserInfo) => void;
  toggleCollapsedMenu: () => void;
  setIsAuthenticated: (open: boolean) => void;
  setShowNotify: (open: boolean) => void;
  setShowChangePassModal: (open: boolean) => void;
  logoutStore: () => Promise<void>;
}

const useConfigAppStore = create(
  persist<IConfigAppStore>(
    (set, getState) => ({
      collapsedMenu: false,
      showNotify: false,
      isAuthenticated: false,
      showChangePassModal: false,
      userLogin: null,
      openChangePassword: false,
      setOpenChangePassword(openChangePassword) {
        set(() => ({ openChangePassword }));
      },
      dataNotify: {
        data: [],
        totalNotSeen: 0,
      },
      isLoadingMenu: false,
      menuData: [],
      params: defaultParams,
      urlsActive: ['/'],
      setUrlsActive(urlsActive) {
        set(() => ({ urlsActive }));
      },
      setMenuData(menuData) {
        set(() => ({ menuData }));
      },
      setParams(params) {
        set(() => ({ params }));
      },

      setUserLogin(userLogin) {
        const groups = userLogin.groups?.map((e) => e.id);
        const groupOptions = userLogin.groups?.map((e) => ({
          value: e.id,
          label: e.name,
        }));
        const roles = userLogin.roles?.map((e) => e.id);
        const roleOptions = userLogin.roles?.map((e) => ({
          value: e.id,
          label: e.name,
        }));
        set(() => ({
          userLogin: { ...userLogin, groups, groupOptions, roles, roleOptions },
        }));
      },

      toggleCollapsedMenu() {
        const state = getState();
        set(() => ({ collapsedMenu: !state.collapsedMenu }));
      },
      setIsAuthenticated(isLogined) {
        set(() => ({ isAuthenticated: isLogined }));
      },
      setShowNotify(open) {
        set(() => ({ showNotify: open }));
      },
      setShowChangePassModal(show) {
        set(() => ({ showChangePassModal: show }));
      },
      async logoutStore() {
        const refreshToken = StorageService.getRefreshToken(REFRESH_TOKEN_KEY);
        try {
          await LayoutService.logout(refreshToken);
        } catch (e) {
          console.error('Logout failed', e);
        } finally {
          StorageService.removeToken(
            ACCESS_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            FCM_TOKEN_KEY,
            USERNAME
          );
          set(() => {
            return {
              collapsedMenu: false,
              showNotify: false,
              isAuthenticated: false,
              showChangePassModal: false,
              userLogin: null,
              openChangePassword: false,
              dataNotify: {
                data: [],
                totalNotSeen: 0,
              },
              menuData: [],
              params: defaultParams,
              urlsActive: ['/'],
            };
          });
        }
      },
    }),
    {
      name: `${STORAGE_KEY_PREFIX}${APP_CODE}:ConfigApp`,
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

mountStoreDevtool('Store', useConfigAppStore);

export default useConfigAppStore;
