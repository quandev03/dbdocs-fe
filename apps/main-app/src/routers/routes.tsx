import { RouteObject } from 'react-router-dom';
import routesWelcome from '../modules/WelcomePage/routes';
import dashboardRoutes from '../modules/Layouts/pages/Dashboard/routes';

// Use dashboard routes for main application routes
export const protectedRoutes: RouteObject[] = [...dashboardRoutes];
