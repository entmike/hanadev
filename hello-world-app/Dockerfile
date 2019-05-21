# Docker Image containing SAP HANA npm package
FROM node:8-slim

LABEL Maintainer="Mike Howles <mike.howles@gmail.com>"

# Install nginx to handle backend and frontend apps
RUN apt-get update && apt-get install -y nginx

# Add SAP HANA Client NPM package from SAP's npm repository
RUN npm config set @sap:registry https://npm.sap.com && npm i -g @sap/hana-client

# Set the global NPM path Environment variable
ENV NODE_PATH /usr/local/lib/node_modules

# Configure nginx and startup
COPY ./hello-world-app/server.conf /etc/nginx/conf.d/default.conf
# Copy backend Node JS modu
COPY /hello-world-app/backend /app/backend
# Copy production build of Vue frontend app
COPY /hello-world-app/frontend/dist /app/frontend
# Copy startup.sh script
COPY ./hello-world-app/startup.sh /app/startup.sh
# Create upload directory
RUN mkdir -p /app/uploads
# Start Command
WORKDIR /app
CMD ./startup.sh