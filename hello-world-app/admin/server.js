const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hana = require('@sap/hana-client');
require('dotenv').config();

const port = process.env.HELLO_WORLD_ADMIN_PORT || 9099;

let enableHDIRouter = require('./api/enableHDI');
app.use('/api/enableHDI', enableHDIRouter);

let createContainerRouter = require('./api/createContainer');
app.use('/api/createContainer', createContainerRouter);

let createUserRouter = require('./api/createUser');
app.use('/api/createUser', createUserRouter);

let grantHDIRoleRouter = require('./api/grantHDIRole');
app.use('/api/grantHDIRole', grantHDIRoleRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));

app.listen(port, ()=>{
    console.log(`Admin Server started on port ${port}`);
});
