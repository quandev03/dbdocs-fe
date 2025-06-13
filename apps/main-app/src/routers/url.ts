type ParamsType = string | number;
export const pathRoutes = {
  home: '/',
  profile: '/profile',
  login: '/login',
  forgotPassword: '/forgot-password',
  notFound: '/not-found',
  authCallback: '/auth/callback',
  githubCallback: '/login/oauth2/code/github',
  googleCallback: '/login/oauth2/code/google',
  oauthGithubCallback: '/oauth2/authorization/github/callback',
  oauthGoogleCallback: '/oauth2/authorization/google/callback',
  share: '/share',

  // Quản trị hệ thống
  accountAuthorization: '/account-authorization',
  systemUserManager: '/user-manager',
  systemUserManagerAdd: '/user-manager/add',
  systemUserManagerEdit: (id?: ParamsType) =>
    `/user-manager/edit/${id ? id : ':id'}`,
  systemUserManagerView: (id?: ParamsType) =>
    `/user-manager/view/${id ? id : ':id'}`,
  roleManager: '/role-manager',
  roleManagerAdd: '/role-manager/add',
  roleManagerEdit: (id?: ParamsType) => `/role-manager/edit/${id ? id : ':id'}`,
  roleManagerView: (id?: ParamsType) => `/role-manager/view/${id ? id : ':id'}`,
  auditLog: '/audit-log',
};
