import { createHashRouter, ShouldRevalidateFunction } from 'react-router-dom';
import { pathRoutes } from './url';
import { protectedRoutes } from './routes';
import { ErrorPage, NotFoundPage } from '../modules/Errors/index';
import React from 'react';
import { menuItems } from './menu';

const mainRouterShouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

const LOADER_INIT_KEY = 'LOADER_INIT_KEY';

export const routers = createHashRouter([
  {
    path: pathRoutes.home,
    // lazy: async () => {
    //   const { default: Layouts } = await import('../modules/Layouts/pages');
    //   return { 
    //     element: <Layouts />
    //   };
    // },
    loader: async () => {
      // Return menu data for the layout
      const userInfoStr = localStorage.getItem('user_info');
      let profile = null;
      
      if (userInfoStr) {
        try {
          profile = JSON.parse(userInfoStr);
        } catch (e) {
          console.error('Error parsing user info from localStorage:', e);
        }
      }
      
      return {
        menus: menuItems,
        menuData: [],
        profile: profile || { name: 'User', email: 'user@example.com' }
      };
    },
    shouldRevalidate: mainRouterShouldRevalidate,
    errorElement: <ErrorPage />,
    children: [...protectedRoutes],
  },
  {
    path: pathRoutes.login,
    lazy: async () => {
      const { Login } = await import('../modules/Layouts/pages/Auth');
      return { element: <Login /> };
    },
    loader: () => {
      localStorage.removeItem(LOADER_INIT_KEY);
      return null;
    },
    errorElement: <ErrorPage />,
  },
  {
    path: pathRoutes.githubCallback,
    lazy: async () => {
      const { AuthCallback } = await import('../modules/Layouts/pages/Auth');
      return { element: <AuthCallback /> };
    },
    errorElement: <ErrorPage />,
  },
  {
    path: pathRoutes.googleCallback,
    lazy: async () => {
      const { AuthCallback } = await import('../modules/Layouts/pages/Auth');
      return { element: <AuthCallback /> };
    },
    errorElement: <ErrorPage />,
  },
  {
    path: pathRoutes.authCallback,
    lazy: async () => {
      const { AuthCallback } = await import('../modules/Layouts/pages/Auth');
      return { element: <AuthCallback /> };
    },
    errorElement: <ErrorPage />,
  },

  {
    path: pathRoutes.notFound,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
