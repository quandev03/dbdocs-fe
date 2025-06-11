import useConfigAppStore from '../modules/Layouts/stores';
import { ActionsTypeEnum } from '../modules/Layouts/types';
import { useLocation } from 'react-router-dom';

export const useRolesByRouter = (path?: string) => {
  const { menuData } = useConfigAppStore();
  const location = useLocation();
  const pathname = location.pathname;

  const actions: ActionsTypeEnum[] =
    menuData.filter((item) => (path ?? pathname).includes(item?.uri ?? ''))?.[0]
      ?.actions || [];

  return actions;
};
