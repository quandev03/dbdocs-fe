import { RouteObject } from 'react-router-dom';
import { pathRoutes } from '../../routers/url';
const routesWelcome: RouteObject[] = [
  {
    path: pathRoutes.home,
    lazy: async () => {
      const { default: WelcomePage } = await import('./index');
      return { Component: WelcomePage };
    },
  },
];

export default routesWelcome;
