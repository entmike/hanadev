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
    var conn_params = {
        serverNode  : process.env.HANA_SERVERNODE,
        uid         : process.env.HANA_UID,
        pwd         : process.env.HANA_PWD
    };
    
    conn.connect(conn_params, function(err) {
        if (err) {
            conn.disconnect();
            console.log(`Error connecting: ${JSON.stringify(err)}`);
            res.end(err.msg);
        }else{
            conn.exec("SELECT NAME AS KEY, VALUE AS VAL FROM M_SYSTEM_OVERVIEW;", null, function (err, results) {
                conn.disconnect();
                if (err) {
                    res.status(500);
                    res.json(err);
                    console.log(err);
                    res.end();
                }else{
                    res.end(JSON.stringify({
                        backend_information : {
                            server : process.env.HANA_SERVERNODE,
                            user : process.env.HANA_UID
                        },
                        M_SYSTEM_OVERVIEW : results
                    },null,2));
                }
            });
        }
    });
});

module.exports = router;