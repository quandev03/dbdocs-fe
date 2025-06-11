import { IUserInfo, MenuObjectItem } from '../modules/Layouts/types';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { useLoaderData } from 'react-router-dom';

export type LoaderData = {
  profile: IUserInfo;
  menus: ItemType<MenuItemType>[];
  menuData: MenuObjectItem[];
};

export const useGetLoaderData = (): LoaderData => {
  const loaderData = useLoaderData();
  return loaderData as LoaderData;
};
