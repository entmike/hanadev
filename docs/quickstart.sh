#!/bin/bash

# Prompt user to login to Docker
docker login

# Resize Cloud 9 to 20GB
bash <(curl -s https://entmike.github.io/hanadev/resize.sh) 20

# Install Docker Compose
sudo curl -L https://github.com/docker/compose/releases/download/1.24.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure SAP npm Repo and install @sap/hana-client globally
npm config set @sap:registry https://npm.sap.com
npm i -g @sap/hana-client

# Install Vue CLI
npm i -g @vue/cli

# Clone Part 4 Branch of Repo
git clone -b Part4 https://github.com/entmike/hanadev.git

cd hanadev

# Create Docker Compose .env file
cat > .env << EOL
HXE_MASTER_PASSWORD=HXEHana1
HANA_APP_UID=APPUSER
HANA_APP_PWD=HXEHana1
HANA_SERVER=hxehost:39017
HANA_APP_BACKEND=/backend
EOL

# Write production backend endpoint
cat > hello-world-app/frontend/.env.production << EOL
VUE_APP_HANA_APP_BACKEND=/backend
EOL

# Write development backend endpoint (based on current external Cloud 9 IP)
cat > hello-world-app/frontend/.env.development.local << EOL
VUE_APP_HANA_APP_BACKEND=http://`curl http://169.254.169.254/latest/meta-data//public-ipv4`:3333
EOL

# Install npm libs for backend app
cd hello-world-app/backend
npm i

# Install npm libs for frontend app
cd ../frontend
npm i

# Make production build
npm run build
