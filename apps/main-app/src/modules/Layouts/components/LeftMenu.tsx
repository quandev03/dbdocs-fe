import { themeConfig } from '@vissoft-react/common';
import { StyledMenu, StyledSider } from '../styled';
import useConfigAppStore from '../stores';
import { menuItems } from '../../../routers/menu';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AnyElement } from '../types';
import { useGetLoaderData } from '../../../hooks/useLoaderData';

const LeftMenu: FC = memo(() => {
  const loaderData = useGetLoaderData();
  const { pathname } = useLocation();
  const { collapsedMenu, toggleCollapsedMenu } = useConfigAppStore();
  const [openMenuKeys, setOpenMenuKeys] = useState<string[]>([]);
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<string[]>([]);
  const { id, orgCode } = useParams();
  const getOpenKeys = useCallback(() => {
    const result: string[] = [];
    const pathNameSplit = pathname.split('/');

    const singlePopActions = [
      'add',
      'add-group',
      'add-import',
      'add-export',
      'by-file',
      'add-representative',
    ];
    const doublePopActions = [
      'edit',
      'view',
      'edit-group',
      'view-group',
      'impact-history',
      'package-history',
      'package-capacity',
      'sms-history',
      'copy',
      'user-management',
      'debt-detail',
      'package-authorization',
      'view-import',
      'view-export',
      'view-subscriber',
      'view-history',
      'history',
    ];
    const patternUserPartner = /^\/partner-catalog\/user-management/;
    const specialSearchTransaction = 'transaction-search-import-export';

    const findParent = (currentKey: string) => {
      const currentRoute = menuItems.find((item) => item.key === currentKey);
      if (currentRoute && currentRoute.parentId) {
        result.unshift(currentRoute.parentId);
        findParent(currentRoute.parentId);
      }
    };

    if (pathNameSplit.some((item) => singlePopActions.includes(item))) {
      pathNameSplit.pop();
      if (patternUserPartner.test(pathname)) {
        pathNameSplit.pop();
        pathNameSplit.pop();
      }

      const name = pathNameSplit.join('/');
      setSelectedMenuKeys([pathNameSplit.join('/')]);
      findParent(name);
    } else if (pathNameSplit.some((item) => doublePopActions.includes(item))) {
      pathNameSplit.pop();
      pathNameSplit.pop();
      if (patternUserPartner.test(pathname) && orgCode && !!id) {
        pathNameSplit.pop();
        pathNameSplit.pop();
      }
      if (pathname.includes(specialSearchTransaction)) {
        pathNameSplit.pop();
      }
      const name = pathNameSplit.join('/');
      setSelectedMenuKeys([pathNameSplit.join('/')]);
      findParent(name);
    } else {
      setSelectedMenuKeys([pathname]);
      result.push(pathname);
      findParent(pathname);
    }

    return result;
  }, [pathname, orgCode, id]);

  const menusRender = useMemo(() => {
    const menus = loaderData?.menus || [];
    return menus.map((item: AnyElement) => {
      if (item.key === pathname && item.label && typeof item.label === 'object' && item.label.props && item.label.props.title) {
        return { ...item, label: item.label.props.title };
      }
      return item;
    });
  }, [loaderData?.menus, pathname]);

  const handleChange = () => {
    toggleCollapsedMenu();
  };

  useEffect(() => {
    const result: string[] = getOpenKeys();
    if (collapsedMenu) return;
    setOpenMenuKeys(result);
  }, [getOpenKeys, pathname, collapsedMenu]);

  return (
    <StyledSider
      style={{ background: themeConfig.backGroundWhite }}
      trigger={null}
      collapsible
      collapsed={collapsedMenu}
      width={'17.25rem'}
    >
      <div className="logo">
        {collapsedMenu ? (
          <img
            src={''}
            alt="Logo"
            onClick={handleChange}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <img src={''} alt="Logo" width="162" />
        )}
      </div>
      <div className="wrapMenu">
        <StyledMenu
          mode="inline"
          items={menusRender}
          openKeys={openMenuKeys}
          onOpenChange={setOpenMenuKeys}
          selectedKeys={selectedMenuKeys}
          inlineIndent={12}
        />
      </div>
    </StyledSider>
  );
});

export default memo(LeftMenu);
