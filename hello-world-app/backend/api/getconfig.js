const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    fs.readFile(`${process.env.CONFIG}/app.json`, function(err,data) {
        if(err) {
            res.status(500);
            res.json(`An error occured while reading configurating file ${process.env.CONFIG}/app.json}:${err}`);
            res.end();
            return console.log(err);
        }
        let config = {};
        try{
            config = JSON.parse(data);
        }catch(e){
            res.status(500);
            res.json(`An error occured while reading configurating file ${process.env.CONFIG}/app.json}:  ${e.message}`);
            res.end();
            return console.log(e);
        }
        delete config.secret;
        res.status(200);
        res.json(config);
        res.end();
    }); 
});

module.exports = router;