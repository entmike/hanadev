#!/bin/bash

# Update frontend development endpoint for backend API calls
./updateEndpoint.sh

docker run --rm --env-file=./.env \
    --hostname hxe \
    -v hanadev_hana-express:/hana/mounts \
    -p 39017:39017 \
    store/saplabs/hanaexpress:2.00.036.00.20190223.1