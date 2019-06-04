const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');
const logger = require('../utils').logger();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `authUser,authPassword`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    })
    if(!pass){
        res.status(400);
        res.json({
            success : false,
            message : `The following required parameters are missing: ${missing.join(',')}`
        });
        res.end();
        return;
    }
    let conn = hana.createConnection();
    let user = req.body.user;
    let userPassword = req.body.userPassword;
    conn.connect({
        serverNode  : process.env.HANA_SERVERNODE,
        uid         : req.body.authUser,
        pwd         : req.body.authPassword
    }, function(err) {
        if (err) {
            conn.disconnect();
            logger.log(`Error connecting: ${JSON.stringify(err)}`);
            res.status(500);
            res.json(err);
            res.end();
        }else{
            new Promise((resolve,reject)=>{
                logger.log(`Granting CATALOG READ to '${process.env.HANA_UID}''...`);
                conn.exec(`GRANT CATALOG READ TO ${process.env.HANA_UID}`, null, (err, results)=>{ 
                    if (err) return reject(err);
                    resolve(results);
                });
            }).then(data=>{
                logger.log(`Done granting privileges to ${process.env.HANA_UID}.`);
                res.status(200);
                res.json({
                    success : true,
                    message : logger.logs()
                });
                res.end();
            })
            .catch((err)=>{
                logger.log(`An error occured while trying to create user:\n${JSON.stringify(err)}`);
                res.status(500);
                res.json(err);
                logger.log(err);
                res.end();
            });
        }
    });
});

module.exports = router;