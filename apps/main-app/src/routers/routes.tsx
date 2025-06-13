import { RouteObject } from 'react-router-dom';
import routesWelcome from '../modules/WelcomePage/routes';
import routesTextEditor from '../modules/TextEditor/routes';

export const protectedRoutes: RouteObject[] = [
  ...routesWelcome,
  ...routesTextEditor,
];
