const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hana = require('@sap/hana-client');
require('dotenv').config();

const port = process.env.HELLO_WORLD_ADMIN_PORT || 9099;

app.use('/api/enableHDI', require('./api/enableHDI'));
app.use('/api/createContainer', require('./api/createContainer'));
app.use('/api/createUser', require('./api/createUser'));
app.use('/api/grantHDIRole', require('./api/grantHDIRole'));
app.use('/api/mapExternalHost', require('./api/mapExternalHost'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));

app.listen(port, ()=>{
    console.log(`Admin Server started on port ${port}`);
});
