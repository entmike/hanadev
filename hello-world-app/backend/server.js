const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hana = require('@sap/hana-client');
require('dotenv').config();

const port = process.env.BACKEND_PORT || 9999;
process.env.BACKEND_PASSWORD = process.env.BACKEND_PASSWORD || `Admin1234`;

if(!process.env.HANA_SERVERNODE
    || !process.env.HANA_PWD || !process.env.HANA_UID) {
    console.error(`Set the following environment variables:
    HANA_SERVERNODE\tYour HANA hostname:port
    HANA_UID\tYour HANA User
    HANA_PWD\tYour HANA Password`);
}else{
    app.use('/api/overview', require('./api/overview')); 
    app.use('/api/diagnose', require('./api/diagnose'));
    app.use('/api/setupUser', require('./api/setupUser'));
    app.use('/api/backendenv', require('./api/backendenv'));
    app.use('/api/setupprivileges', require('./api/setupPrivileges'));
    app.use('/api/getconfig', require('./api/getconfig'));
    app.use('/api/getallconfig', require('./api/getallconfig'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended : true
    }));
    
    app.listen(port, ()=>{
        console.log(`Backend Server started on port ${port}\nCommunicating as ${process.env.HANA_UID} to HANA Server Node ${process.env.HANA_SERVERNODE}`);
    });
}