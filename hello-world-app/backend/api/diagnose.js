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
    let checkTemplate = {
        text : '',
        status : 'Not Started',
        message : '',
        remedy : {},
        data : {}
    };
    // Initialize issue check list.  Since this API fired, at least the backend test passed.
    let connectivityTest = JSON.parse(JSON.stringify(checkTemplate));
    connectivityTest.text = `Application Backend Connection Test`;
    connectivityTest.status = `Passed`;
    connectivityTest.message = `Connected with the backend application API successfully.`;
    let checks = [connectivityTest];
    
    new Promise((resolve,reject)=>{
        // TEST DB CONNECTIVITY
        console.log('Testing connection...');
        let test = JSON.parse(JSON.stringify(checkTemplate));
        test.text = `HANA DB Connectivity Test`;
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
        console.log('Testing DB Services...');
        return new Promise((resolve,reject)=>{
            // CHECK IF DB Services are enabled
            let test = JSON.parse(JSON.stringify(checkTemplate));
            checks.push(test);
            test.text = `Checking if DB Services are enabled...`;
            if(data.status!="Pass") return resolve(test);
            conn.exec(`SELECT
                SUM(CASE WHEN SERVICE_NAME = 'diserver' THEN 1 ELSE 0 END) AS diserver,
                SUM(CASE WHEN SERVICE_NAME = 'docstore' THEN 1 ELSE 0 END) AS docstore,
                SUM(CASE WHEN SERVICE_NAME = 'scriptserver' THEN 1 ELSE 0 END) AS scriptserver,
                SUM(CASE WHEN SERVICE_NAME = 'dpserver' THEN 1 ELSE 0 END) AS dpserver
                FROM M_SERVICES
                WHERE ACTIVE_STATUS = 'YES'
                ;`, null, (err, results)=>{ 
                    if(err){
                        test.pass = `Fail`;
                        test.message = `Could not query M_SERVICES to get service states.`;
                        test.data = err;
                    }else{
                        var result = results[0];
                        if(result.DISERVER !=1 || result.DOCSTORE !=1 || result.SCRIPTSERVER !=1 || result.DPSERVER !=1 ){
                            test.message = `One or more services are not yet enabled on the tenant DB ${process.env.tenantDB}`;
                            test.status = `Fail`;
                            test.remedy = {
                                component : 'EnableServices',
                                endpoint : '/api/setupuser',
                                defaults : {authUser : "SYSTEM"},
                                message : 'Using a User Administator ID, this will enable DISERVER and DOCSTORE on your Tenant DB'
                            }
                        }
                    }
                    resolve(test);
                });
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