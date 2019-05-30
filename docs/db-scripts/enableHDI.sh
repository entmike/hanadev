#!/bin/bash

/usr/sap/HXE/HDB90/exe/hdbsql -i 90 -d SYSTEMDB -A -m -j -V $3 -u $1 -p $2 -I /scripts/enable_hdi.sql
