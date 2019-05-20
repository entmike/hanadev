# Docker Image containing SAP HANA npm package
FROM node:8-slim

LABEL Maintainer="Mike Howles <mike.howles@gmail.com>"

# Add SAP HANA Client NPM package from SAP's npm repository
RUN npm config set @sap:registry https://npm.sap.com && npm i -g @sap/hana-client

# Set the global NPM path Environment variable
ENV NODE_PATH /usr/local/lib/node_modules
COPY /hello-world-app/backend /app/backend
WORKDIR /app/backend
CMD npm run prod