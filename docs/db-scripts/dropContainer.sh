#!/bin/bash

/usr/sap/HXE/HDB90/exe/hdbsql -n localhost:39017 -A -m -j -V $1,$2 -u $3 -p $4 -I /scripts/drop_container.sql
