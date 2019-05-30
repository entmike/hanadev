#!/bin/bash

docker run --rm --env-file=./.env \
    --name hxe \
    --hostname hxe \
    -v hanadev_hana-express:/hana/mounts \
    -v $HOME/environment/hanadev/db-scripts:/scripts \
    -p 39017:39017 \
    -p 39041:39041 \
    store/saplabs/hanaexpress:2.00.036.00.20190223.1
