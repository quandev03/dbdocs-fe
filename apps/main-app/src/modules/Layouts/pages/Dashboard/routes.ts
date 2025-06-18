import { RouteObject } from 'react-router-dom';
import { pathRoutes } from '../../../../routers/url';

const dashboardRoutes: RouteObject[] = [
  {
    path: pathRoutes.home,
    lazy: async () => {
      const { default: HomePage } = await import('./HomePage');
      return { Component: HomePage };
    },
  },
  {
    path: '/projects',
    lazy: async () => {
      const { default: HomePage } = await import('./HomePage');
      return { Component: HomePage };
    },
  },
  {
    path: pathRoutes.share,
    lazy: async () => {
      const { default: SharePage } = await import('./SharePage');
      return { Component: SharePage };
    },
  },
  {
    path: pathRoutes.dbmlEditor,
    lazy: async () => {
      const { default: DbmlEditorPage } = await import('../../../Dashboard/pages/DbmlEditorPage');
      return { Component: DbmlEditorPage };
    },
  },
  {
    path: `${pathRoutes.dbmlEditor}/:projectId`,
    lazy: async () => {
      const { default: DbmlEditorPage } = await import('../../../Dashboard/pages/DbmlEditorPage');
      return { Component: DbmlEditorPage };
    },
  },
];

export default dashboardRoutes; 