# React Monorepo Base

<a alt="Nx logo" href="https://vissoft.vn/" target="_blank" rel="noreferrer"><img src="https://vissoft.vn/upload/images/group-34075.png" width="45"></a>

✨ **Workspace được tạo bởi [Venn](https://github.com/ChuNguyenChuong) - Vissoft** ✨

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Scripts chính](#scripts-chính)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [Testing](#testing)
- [Nx Commands](#nx-commands)

## 🎯 Tổng quan

React Monorepo Base là template chuẩn cho các dự án React sử dụng Nx workspace. Được thiết kế với:

- **Scalability**: Dễ dàng mở rộng với nhiều apps và libraries
- **Developer Experience**: Setup sẵn tools và best practices
- **Performance**: Optimized builds với Vite và Nx caching
- **Type Safety**: Full TypeScript support

## 🛠 Công nghệ sử dụng

### Core Technologies

- **React 18.3.1** - UI Library
- **TypeScript 5.5.2** - Type safety
- **Vite** - Build tool và dev server
- **Nx 19.5.6** - Monorepo management

### UI & Styling

- **Tailwind CSS 3.4.3** - Utility-first CSS
- **Styled Components 6.1.16** - CSS-in-JS
- **Ant Design 5.26.0** - UI Component library
- **Lucide React** - Icon library

### State Management

- **Zustand 5.0.5** - Lightweight state management
- **TanStack Query 5.69.0** - Server state management

### Testing

- **Vitest** - Unit testing framework
- **Jest** - Testing utilities
- **React Testing Library** - Component testing

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Yarn** - Package manager√

## 🚀 Cài đặt

### Prerequisites

- Node.js >= 18
- Yarn >= 1.22

### Installation Steps

```bash
# Clone repository
git clone <repository-url>
cd React-Monorepo-Base

# Install dependencies
yarn install

# Setup environment (nếu cần)
cp .env.example .env.local
```

## 📝 Scripts chính

### Development

```bash
yarn dev:main          # 🚀 Chạy main-app development mode
yarn nx:graph          # 📊 Xem dependency graph
yarn nx:reset          # 🔄 Reset Nx cache
```

### Build & Production

```bash
yarn build:main        # 🏗️  Build main-app for production
yarn start:main        # ▶️  Serve built files (port 3000)
```

### Library Management

```bash
yarn vis-add <name>    # 📦 Tạo library mới trong libs/
```

### Utilities

```bash
yarn nx:repair         # 🔧 Sửa chữa Nx workspace
```

## 📁 Cấu trúc dự án

```
React-Monorepo-Base/
├── 📁 apps/                    # Ứng dụng chính
│   └── 📁 main-app/           # React app chính
│       ├── 📁 src/
│       │   ├── 📁 app/        # App component và routing
│       │   ├── 📁 assets/     # Static assets
│       │   └── main.tsx       # Entry point
│       ├── index.html
│       ├── vite.config.ts     # Vite configuration
│       └── tailwind.config.js # Tailwind config
│
├── 📁 libs/                   # Shared libraries
│   ├── 📁 common/            # Common components/utils
│   └── 📁 [other-modules]/   # Feature modules
│
├── 📁 dist/                   # Build output
│   └── 📁 apps/
│       └── 📁 main-app/      # Production build
│
├── 📁 .cursor/               # Cursor IDE rules
│   └── 📁 rules/            # Development guidelines
│
├── 📊 package.json           # Root dependencies & scripts
├── 📊 nx.json               # Nx workspace config
├── 📊 tsconfig.base.json    # TypeScript base config
└── 📋 README.md             # This file
```

## 💻 Development

### Khởi động Development Server

```bash
yarn dev:main
```

- App sẽ chạy tại: http://localhost:4200
- Hot reload enabled
- TypeScript checking
- ESLint integration

### Tạo Library mới

```bash
yarn vis-add my-feature
```

Sẽ tạo library mới tại `libs/my-feature/` với:

- TypeScript setup
- Vitest testing
- Export barrel (index.ts)

### Best Practices

- 📝 Code theo TypeScript strict mode
- 🎨 Sử dụng Tailwind CSS cho styling
- 🧪 Viết tests cho components
- 📐 Follow ESLint rules
- 🔄 Commit với conventional commit format

## 🏗️ Build & Deploy

### Development Build

```bash
yarn build:main
```

### Production Serve

```bash
yarn start:main
```

- Serves từ `dist/apps/main-app/`
- Production optimized
- Chạy trên port 3000

### CI/CD Integration

- Build artifacts trong `dist/`
- Support Docker deployment
- Environment variables từ `.env.local`

## 🧪 Testing

### Chạy Tests

```bash
# Tất cả tests
yarn test

# Watch mode
yarn test --watch

# Coverage report
yarn test --coverage
```

### Testing Guidelines

- Unit tests cho components
- Integration tests cho features
- Accessibility testing
- Performance testing

## ⚡ Nx Commands

### Workspace Management

```bash
# Xem project graph
npx nx graph

# Reset cache
npx nx reset

# Repair workspace
npx nx repair
```

### Running Tasks

```bash
# Chạy specific target
npx nx <target> <project>

# Multiple targets
npx nx run-many -t build test

# Filtered projects
npx nx run-many -t build -p main-app
```

### Generate Commands

```bash
# Tạo React component
npx nx g @nx/react:component MyComponent --project=main-app

# Tạo library
npx nx g @nx/react:library my-lib --directory=libs/my-lib
```

## 📚 Resources

### Documentation

- 📖 [Nx Documentation](https://nx.dev)
- ⚛️ [React Documentation](https://react.dev)
- 🎨 [Tailwind CSS](https://tailwindcss.com)
- 📘 [TypeScript Handbook](https://typescriptlang.org)

### Project Guidelines

- 📋 [Coding Standards](.cursor/rules/coding-standards.mdc)
- 🎨 [UI Components](.cursor/rules/ui-components.mdc)
- 🔄 [Development Workflow](.cursor/rules/development-workflow.mdc)
- 🏗️ [Project Structure](.cursor/rules/project-structure.mdc)

## 🤝 Contributing

### Git Workflow

1. Tạo branch theo naming convention
2. Code & commit với conventional format
3. Push và tạo Pull Request
4. Code review & merge

### 🌿 Branch Naming Rules

#### Protected Branches (Chỉ admin)

- `main` - Production branch
- `develop` - Development branch
- `test` - Testing environment
- `uat` - User Acceptance Testing
- `dev-common` - Common development

> ⚠️ **Lưu ý**: Chỉ user có email `chunguyenchuong2014bg@gmail.com` mới được push trực tiếp lên các protected branches.

#### Feature Branches (Tất cả developers)

- `feature/*` - Tính năng mới
- `bugfix/*` - Sửa lỗi
- `hotfix/*` - Sửa lỗi khẩn cấp
- `release/*` - Chuẩn bị release
- `deploy/*` - Deploy scripts/configs
- `conflict/*` - Giải quyết conflicts

**Ví dụ branch names:**

```bash
feature/user-authentication
bugfix/fix-login-error
hotfix/security-patch
release/v1.2.0
```

### 📝 Commit Message Rules

Project sử dụng **Conventional Commits** với **commitlint** để kiểm tra format.

#### Format bắt buộc:

```
type(SCOPE): subject
```

#### Types cho phép:

- `feat` - Tính năng mới
- `bug` - Sửa lỗi
- `hotfix` - Sửa lỗi khẩn cấp
- `release` - Release version

#### Scope rules:

- **Bắt buộc** phải có scope
- Format: **UPPERCASE** với chữ cái, số và dấu gạch ngang
- Ví dụ: `C010GESIM-0`, `USER-AUTH`, `API-V1`

#### Subject rules:

- **Không được để trống**
- **Không được kết thúc bằng dấu chấm**
- **Tối đa 150 ký tự**

#### ✅ Ví dụ commit messages đúng:

```bash
feat(USER-AUTH): thêm chức năng đăng nhập
bug(API-V1): sửa lỗi validation email
hotfix(SECURITY): cập nhật dependencies
release(V1-2-0): chuẩn bị release version 1.2.0
```

#### ❌ Ví dụ commit messages sai:

```bash
# Thiếu type và scope
Thêm chức năng đăng nhập

# Scope không đúng format (phải UPPERCASE)
feat(user-auth): thêm chức năng đăng nhập

# Kết thúc bằng dấu chấm
feat(USER-AUTH): thêm chức năng đăng nhập.

# Thiếu scope
feat: thêm chức năng đăng nhập
```

### 🚫 Pre-commit Hooks

Project có cấu hình **husky hooks**:

1. **Pre-commit hook**:

   - Kiểm tra branch naming convention
   - Chạy build để đảm bảo code không lỗi
   - Kiểm tra quyền push lên protected branches

2. **Commit-msg hook**:
   - Validate commit message format với commitlint
   - Đảm bảo tuân thủ conventional commits

#### Bypass hooks (Không khuyến nghị):

```bash
# Bỏ qua pre-commit hook
git commit --no-verify -m "feat(SCOPE): commit message"

# Bỏ qua commit-msg hook
git commit --no-edit --no-verify
```

### 🔧 Troubleshooting Commit Issues

#### Lỗi Branch Naming:

```bash
# Đổi tên branch hiện tại
git branch -m new-branch-name

# Hoặc tạo branch mới
git checkout -b feature/ten-tinh-nang
```

#### Lỗi Commit Message:

```bash
# Sửa commit message cuối cùng
git commit --amend -m "feat(SCOPE): mô tả ngắn gọn"

# Hoặc commit với format đúng
git commit -m "feat(USER-AUTH): thêm chức năng đăng nhập"
```

---

🏢 **Developed by [Vissoft Vietnam](https://vissoft.vn)**
