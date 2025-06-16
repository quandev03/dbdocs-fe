import { createBrowserRouter } from 'react-router-dom';
import Login from './modules/Layouts/pages/Auth/Login';
import HomePage from './modules/Layouts/pages/Dashboard/HomePage';
import SharePage from './modules/Layouts/pages/Dashboard/SharePage';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import DocumentationPage from './modules/Dashboard/pages/DocumentationPage';
import { DbmlEditorPage } from './modules/Dashboard/pages/DbmlEditorPage';
import NotFound from './modules/Errors/NotFound';
import ErrorBoundary from './modules/Errors/ErrorBoundary';

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
    errorElement: <NotFound />,
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: '/share',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <SharePage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: '/projects/:projectId/docs',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <DocumentationPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: '/dbml-editor/:projectId',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <DbmlEditorPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]); 