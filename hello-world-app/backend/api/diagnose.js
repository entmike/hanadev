const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    let conn = hana.createConnection();
    let checks = [];
    new Promise((resolve,reject)=>{
        // TEST CONNECTIVITY
        console.log('Testing connection...');
        let test = {
            text : "Connectivity Test",
            status : "Not started",
            data : {}
        };
        checks.push(test);
        conn.connect({
            serverNode  : process.env.HANA_SERVERNODE,
            uid         : process.env.HANA_UID,
            pwd         : process.env.HANA_PWD
        }, function(err) {
            if(err) {
                test.status = "Failed";
                test.data = err;
                switch (err.code){
                    case -10709:
                        test.message = `Cannot reach the HANA Database server at "${process.env.HANA_SERVERNODE}".  Make sure that it is running and accessible.`;
                        break;
                    case 10:
                        test.message = `Authentication with application user ${process.env.HANA_UID} failed.  Check that the user exists and has the correct password.`;
                        test.remedy = {
                            component : 'SetupUser',
                            endpoint : '/api/setupuser',
                            defaults : {authUser : "SYSTEM"},
                            message : 'Using a User Administator ID, this will create the Application User and reset the password to that which is set in your application configuration'
                        }
                        break;
                    default:
                        test.message = err;
                }
            }else{
                test.status = "Pass";
                test.message = "Application User authenticated successfully.";
            }
            return resolve(test);
        });
    }).then(data=>{
        // RETURN RESULTS
        console.log(checks);
        res.status(200);
        res.json(checks);
        res.end();
    });
});

module.exports = router;