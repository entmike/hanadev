#!/bin/bash

/usr/sap/HXE/HDB90/exe/hdbsql -i 90 -d HXE -A -m -j -V $1,$2,$3 -u $4 -p $5 -I /scripts/grant-role.sql
