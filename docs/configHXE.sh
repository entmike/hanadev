#!/bin/bash

# Configure HANA Express system parameters
docker exec hanadev_hxehost_1 /usr/sap/HXE/HDB90/exe/hdbsql -n localhost:39017 -u SYSTEM -p HXEHana1 "ALTER SYSTEM ALTER CONFIGURATION ('global.ini', 'system') SET ('public_hostname_resolution', 'use_default_route') = 'name' WITH RECONFIGURE;"
docker exec hanadev_hxehost_1 /usr/sap/HXE/HDB90/exe/hdbsql -n localhost:39017 -u SYSTEM -p HXEHana1 "ALTER SYSTEM ALTER CONFIGURATION ('global.ini', 'system') SET ('public_hostname_resolution', 'map_localhost') = 'localhost' WITH RECONFIGURE;"
