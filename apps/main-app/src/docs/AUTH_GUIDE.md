# 🔐 Authentication System Guide

## Overview
Hệ thống authentication được xây dựng theo hướng dẫn của bạn với OAuth 2.0 cho Google và GitHub.

## 🏗️ Cấu trúc hệ thống

### 1. AuthService (`src/services/authService.ts`)
- **TokenData Interface**: Định nghĩa cấu trúc token
- **User Interface**: Định nghĩa cấu trúc user info
- **Methods**:
  - `saveToken()` - Lưu token vào localStorage
  - `getToken()` - Lấy token từ localStorage
  - `getAuthorizationHeader()` - Tạo Authorization header
  - `isAuthenticated()` - Kiểm tra trạng thái đăng nhập
  - `logout()` - Đăng xuất
  - `loginWithGoogle()` - Đăng nhập với Google
  - `loginWithGitHub()` - Đăng nhập với GitHub
  - `checkTokenValidity()` - Kiểm tra token còn hạn không
  - `fetchUserInfo()` - Lấy thông tin user từ API

### 2. AuthContext (`src/contexts/AuthContext.tsx`)
React Context cung cấp:
- **State**: `user`, `loading`, `error`, `isAuthenticated`
- **Methods**: `login()`, `logout()`, `refreshUserInfo()`

### 3. useAuth Hook (`src/contexts/AuthContext.tsx`)
Custom hook để sử dụng AuthContext trong components.

### 4. Components

#### Login Component (`src/modules/Auth/Login/index.tsx`)
- Modern UI với Tailwind CSS
- 2 buttons: Google và GitHub OAuth
- Loading states và error handling
- Responsive design

#### AuthCallback Component (`src/components/auth/AuthCallback.tsx`)
- Xử lý OAuth callback từ backend
- Parse URL parameters: `token`, `tokenType`, `expiresIn`, `provider`
- Save token và fetch user info
- Redirect về dashboard sau khi thành công

#### Dashboard Component (`src/pages/Dashboard.tsx`)
- Hiển thị thông tin user
- User profile card với avatar
- Provider badge (Google/GitHub)
- Logout functionality
- Quick stats và recent activity

#### ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)
- Wrapper cho routes cần authentication
- Auto redirect về login nếu chưa đăng nhập

## 🚀 Cách sử dụng

### 1. Cấu hình Environment Variables
Tạo file `.env` trong `apps/main-app/`:

```env
# Frontend Configuration
VITE_FRONTEND_URL=http://localhost:3000

# Backend API Configuration  
VITE_API_DOMAIN=http://localhost:8080

# OAuth Configuration
VITE_GOOGLE_AUTH_URL=/oauth2/authorization/google
VITE_GITHUB_AUTH_URL=/oauth2/authorization/github
```

### 2. Backend Requirements
Backend cần có các endpoints:

```
# OAuth Redirects
GET /oauth2/authorization/google
GET /oauth2/authorization/github

# OAuth Callback (sẽ redirect về frontend)
# Redirect format: /auth/callback?token=xxx&tokenType=Bearer&expiresIn=86400000&provider=google

# API Endpoints
GET /api/auth/test - Validate token
GET /api/user/me - Get user info
```

### 3. Flow đăng nhập

1. **User click login button** → Login component
2. **Redirect to OAuth provider** → AuthService.loginWithGoogle/GitHub()
3. **OAuth provider callback** → Backend xử lý OAuth
4. **Backend redirect về frontend** → `/auth/callback?token=xxx&...`
5. **AuthCallback xử lý** → Parse token, save token, fetch user info
6. **Redirect to dashboard** → Dashboard hiển thị user info

### 4. Sử dụng trong Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Welcome {user.name}!</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### 5. Protected Routes

```typescript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 🛠️ API Calls với Authentication

```typescript
import authService from '../services/authService';

// Automatic token injection
const response = await fetch('/api/data', {
  headers: {
    'Authorization': authService.getAuthorizationHeader(),
    'Content-Type': 'application/json'
  }
});
```

## 🎨 UI Components

### Login Page
- **Design**: Modern, clean với Tailwind CSS
- **Features**: Google/GitHub buttons, loading states, error handling
- **Responsive**: Mobile-friendly

### Dashboard
- **Layout**: Header + sidebar layout
- **Profile Card**: Avatar, user info, provider badge
- **Actions**: Logout button, navigation to other pages
- **Stats**: Quick stats cards

## 🔒 Security Features

1. **Token Expiration**: Automatic token validation và auto-logout
2. **Secure Storage**: Tokens stored in localStorage với expiry time
3. **Route Protection**: ProtectedRoute component
4. **Error Handling**: Comprehensive error handling cho OAuth flows
5. **HTTPS Redirect**: Production environment redirects

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing authentication token" error**
   - Kiểm tra backend có redirect đúng format không
   - Verify URL parameters trong callback

2. **"Login timeout" error**
   - Kiểm tra popup không bị blocked
   - Verify OAuth configuration ở backend

3. **"Failed to fetch user info" error**
   - Kiểm tra API endpoint `/api/user/me`
   - Verify token được save correctly

4. **Infinite redirect loops**
   - Kiểm tra redirect URLs trong OAuth config
   - Verify frontend URL configuration

## 📝 Development Notes

- Sử dụng TypeScript cho type safety
- Tailwind CSS cho styling
- Antd components cho UI elements
- React Router v6 cho routing
- localStorage cho token storage

## 🎯 Next Steps

1. Add refresh token functionality
2. Implement remember me feature
3. Add social login analytics
4. Setup automated testing
5. Add rate limiting protection 