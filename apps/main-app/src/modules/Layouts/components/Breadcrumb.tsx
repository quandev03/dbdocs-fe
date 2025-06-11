import { Breadcrumb } from 'antd';
import {
  BreadcrumbItemType,
  BreadcrumbSeparatorType,
} from 'antd/es/breadcrumb/Breadcrumb';
import React, { memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { menuItems } from '../../../routers/menu';
import { House } from 'lucide-react';

const specialPaths = [
  {
    key: 'view',
    label: 'Xem chi tiết',
  },
  {
    key: 'add',
    label: 'Tạo mới',
  },
  {
    key: 'edit',
    label: 'Chỉnh sửa',
  },
  {
    key: 'history',
    label: 'Lịch sử điểm',
  },
];

const BreadcrumbComponent: React.FC = () => {
  const { pathname } = useLocation();
  const { id } = useParams<{ id?: string }>();

  const getLabelFromMenuItems = useCallback((key: string): string => {
    const menuItem = menuItems.find((item) => item.key === `/${key}`);
    return menuItem ? menuItem.label : key;
  }, []);

  const getItemFromMenuItems = useCallback((key: string) => {
    return menuItems.find((item) => item.key === `/${key}` || item.key === key);
  }, []);

  const getParentItemFromMenuItems = useCallback((key: string) => {
    const result: string[] = [];
    const menuItem = menuItems.find((item) => item.key === key);
    if (menuItem) {
      result.push(
        menuItem.key.startsWith('/') ? menuItem.key.slice(1) : menuItem.key
      );
      if (menuItem.parentId) {
        const subResult = getParentItemFromMenuItems(menuItem.parentId);
        result.push(...subResult);
      }
    }
    return result;
  }, []);

  const breadcrumbItems = useMemo(() => {
    let pathSnippets = pathname.split('/').filter((i) => i);
    const parentItem = getParentItemFromMenuItems(`/${pathSnippets[0]}`);
    if (parentItem.length > 0) parentItem.shift();
    parentItem.reverse();
    pathSnippets = parentItem.concat(pathSnippets);

    const resultNode: Partial<BreadcrumbItemType & BreadcrumbSeparatorType>[] =
      pathSnippets.map((_) => {
        const itemInMenus = getItemFromMenuItems(_);
        const item: Partial<BreadcrumbItemType & BreadcrumbSeparatorType> = {
          title: null,
        };
        if (itemInMenus) {
          item.title = !itemInMenus.hasChild ? (
            <Link to={itemInMenus.key} className="!text-black">
              {itemInMenus.icon ? itemInMenus.icon : null} {itemInMenus.label}
            </Link>
          ) : (
            itemInMenus.label
          );
        } else {
          item.title = getLabelFromMenuItems(_);
        }
        const nameSpecial = specialPaths.find((item) => _.includes(item.key));
        if (nameSpecial) item.title = nameSpecial.label;
        if (_ === id) {
          item.title = '';
        }
        return item;
      });

    resultNode.unshift({
      href: `/`,
      title: <House />,
    });
    if (pathname === `/`) {
      resultNode.push({
        title: 'Trang chủ',
      });
    }

    return resultNode.filter((item) => item.title);
  }, [
    id,
    pathname,
    getParentItemFromMenuItems,
    getItemFromMenuItems,
    getLabelFromMenuItems,
  ]);

  return <Breadcrumb className="mt-3 !pl-7" items={breadcrumbItems} />;
};

export default memo(BreadcrumbComponent);
