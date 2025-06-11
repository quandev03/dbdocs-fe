import { createHashRouter, ShouldRevalidateFunction } from 'react-router-dom';
import { pathRoutes } from './url';
import { protectedRoutes } from './routes';
import { ErrorPage, NotFoundPage } from '../modules/Errors/index';

const mainRouterShouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

const LOADER_INIT_KEY = 'LOADER_INIT_KEY';

export const routers = createHashRouter([
  {
    path: pathRoutes.home,
    lazy: async () => {
      const { default: Layouts } = await import('../modules/Layouts/pages');
      return { element: <Layouts /> };
    },
    loader: async () => {
      return {};
    },
    shouldRevalidate: mainRouterShouldRevalidate,
    errorElement: <ErrorPage />,
    children: [...protectedRoutes],
  },
  {
    path: pathRoutes.login,
    element: <div>Login</div>,
    loader: () => {
      localStorage.removeItem(LOADER_INIT_KEY);
      return null;
    },
    errorElement: <ErrorPage />,
  },
  {
    path: pathRoutes.forgotPassword,
    element: <div>ForgotPassword</div>,
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
