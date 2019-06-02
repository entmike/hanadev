#!/bin/bash

docker run --rm --env-file=./.env \
    --name hxe \
    --hostname hxe \
    -v $1:/hana/mounts \
    -p 39017:39017 \
    -p 39041:39041 \
    store/saplabs/hanaexpress:2.00.036.00.20190223.1
