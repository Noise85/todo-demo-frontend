# Stage 1: Build the Next.js app and export it
FROM node:22.14.0 AS builder

WORKDIR /app

# Copy only the dependency definitions first
COPY package*.json ./

RUN npm install -g npm@11.3.0 &&\
    npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build and export the static site (Next will export to /app/out)
RUN npm run build

# Stage 2: Apache image to serve static files
FROM httpd:2.4-alpine

# Set ServerName to iceage.local
RUN sed -i 's|#ServerName www.example.com:80|ServerName iceage.local|' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/Listen 80/Listen 8080/' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i '/<Directory "\/usr\/local\/apache2\/htdocs">/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /usr/local/apache2/conf/httpd.conf && \
    rm -rf /usr/local/apache2/htdocs/*

# Copy exported static site
COPY --from=builder /app/out/ /usr/local/apache2/htdocs/
COPY --from=builder /app/public/.htaccess /usr/local/apache2/htdocs/.htaccess

EXPOSE 8080