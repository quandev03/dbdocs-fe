import { RouteObject } from 'react-router-dom';
import { pathRoutes } from '../../routers/url';
const routesWelcome: RouteObject[] = [
  {
    path: pathRoutes.textEditor,
    lazy: async () => {
      const { default: TextEditorPage } = await import('./pages/index');
      return { Component: TextEditorPage };
    },
  },
];

export default routesWelcome;
