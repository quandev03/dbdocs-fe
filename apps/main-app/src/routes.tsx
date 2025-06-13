import { createBrowserRouter } from 'react-router-dom';
import Login from './modules/Layouts/pages/Auth/Login';
import HomePage from './modules/Layouts/pages/Dashboard/HomePage';
import SharePage from './modules/Layouts/pages/Dashboard/SharePage';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthRedirect
        authenticatedRedirect="/"
        unauthenticatedRedirect="/login"
        requireAuth={false}
      >
        <Login />
      </AuthRedirect>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/share',
    element: (
      <ProtectedRoute>
        <SharePage />
      </ProtectedRoute>
    ),
  },
]); 