#!/bin/bash
sudo curl -L https://github.com/docker/compose/releases/download/1.24.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
git clone -b Part4 https://github.com/entmike/hanadev.git
cd hanadev
wget https://entmike.github.io/hanadev/.env
