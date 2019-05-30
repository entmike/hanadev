#!/bin/bash

/usr/sap/HXE/HDB90/exe/hdbsql -i 90 -d HXE -A -m -j -V $1,$2 -u $3 -p $4 -I /scripts/create_container.sql
