#!/bin/bash

cat > hello-world-app/frontend/.env.development.local << EOL
VUE_APP_HANA_APP_BACKEND=http://`curl http://169.254.169.254/latest/meta-data//public-ipv4`:3333
EOL
