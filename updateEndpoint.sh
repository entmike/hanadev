#!/bin/bash

cat > ~/environment/hanadev/hello-world-app/frontend/.env.development.local << EOL
VUE_APP_HANA_APP_BACKEND=http://`curl -s http://169.254.169.254/latest/meta-data//public-ipv4`:3333
VUE_APP_HANA_APP_ADMIN=http://`curl -s http://169.254.169.254/latest/meta-data//public-ipv4`:9090
EOL
