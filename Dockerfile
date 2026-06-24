# Stage 1: Build React/Vite app from root context
FROM node:20-alpine AS builder
WORKDIR /app
COPY web-app/package*.json ./
RUN npm ci
COPY web-app/ .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY web-app/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
