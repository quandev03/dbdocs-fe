# -------- BUILD STAGE --------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY .yarn ./.yarn
COPY .yarnrc.yml ./
RUN yarn install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the project
RUN yarn build:main

# -------- PRODUCTION STAGE --------
FROM nginx:alpine

# Copy the build output
COPY --from=builder /app/dist/apps/main-app /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a shell script to generate env-config.js
RUN echo '#!/bin/sh' > /docker-entrypoint.sh
RUN echo 'echo "window._env_ = {" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh
RUN echo 'printenv | grep VITE_ | while read -r line; do' >> /docker-entrypoint.sh
RUN echo '  key=$(echo "$line" | cut -d= -f1)' >> /docker-entrypoint.sh
RUN echo '  value=$(echo "$line" | cut -d= -f2-)' >> /docker-entrypoint.sh
RUN echo '  echo "  $key: \"$value\"," >> /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh
RUN echo 'done' >> /docker-entrypoint.sh
RUN echo 'echo "};" >> /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh
RUN echo 'cat /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.sh
RUN echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Run nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
