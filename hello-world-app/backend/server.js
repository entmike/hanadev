const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hana = require('@sap/hana-client');
require('dotenv').config();

const port = process.env.PORT || 9999;

if(!process.env.HANA_SERVERNODE
    || !process.env.HANA_PWD || !process.env.HANA_UID) {
    console.error(`Set the following environment variables:
    HANA_SERVERNODE\tYour HANA hostname:port
    HANA_UID\tYour HANA User
    HANA_PWD\tYour HANA Password
    UPLOAD_DIR\tUpload directory for user CSV Uploads`);
}else{
    let overviewRouter = require('./api/overview');
    let uploadRouter = require('./api/upload');
    app.use('/api/overview', overviewRouter);
    app.use('/api/upload', uploadRouter);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended : true
    }));
    
    app.listen(port, ()=>{
        console.log(`Server started on port ${port}`);
    });
}