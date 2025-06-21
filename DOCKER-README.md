# Docker Setup for DBDOCS Frontend

This document explains how to run the DBDOCS frontend application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# API Configuration
VITE_API_DOMAIN=http://your-api-domain
VITE_BASE_SIGNLINK_URL=http://your-signlink-domain
VITE_API_URL=/api

# Frontend Configuration
VITE_FRONTEND_URL=http://your-frontend-domain

# Authentication Configuration
VITE_AUTH_ENABLED=true
VITE_GOOGLE_AUTH_URL=/auth/google
VITE_GITHUB_AUTH_URL=/auth/github
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_INTERNAL_SITE_OIDC_CLIENT_ID=internal-client-id
VITE_INTERNAL_SITE_CLIENT_SECRET=internal-client-secret

# Firebase Configuration (if used)
VITE_FIREBASE_CONFIG_OBJECT={"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""}
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# App Configuration
VITE_APP_VERSION=1.0.0
VITE_STORAGE_KEY_PREFIX=dbdocs-
```

## Build and Run

To build and run the application:

```bash
docker-compose up -d --build
```

This will:
1. Build the Docker image using the Dockerfile
2. Start a container running the application
3. The application will be available on port 3000 (configured in docker-compose.yml)

## Additional Information

### Architecture

- The Docker setup uses a multi-stage build process:
  - First stage: Node.js environment to build the React application
  - Second stage: Nginx to serve the built static files

### Environment Variable Injection

- Environment variables are injected into the application at runtime using the `/usr/share/nginx/html/env-config.js` file
- This allows configuring the application without rebuilding the Docker image

### Custom Nginx Configuration

- The provided `nginx.conf` includes settings for:
  - Serving the SPA (Single Page Application)
  - Proper caching headers
  - Supporting client-side routing

## Troubleshooting

If you encounter issues:

1. Check the Docker container logs:
   ```bash
   docker-compose logs
   ```

2. Verify your environment variables are correctly set in `.env`

3. Ensure the API services are accessible from the container

4. Accessing the application:
   - The application will be available at http://localhost:3000 