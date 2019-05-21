const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const csv = require('csv-parser');
const promisify = require('util').promisify;
const fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    let form = new formidable.IncomingForm();
    form.uploadDir = '/app/uploads';
    form.parse(req, (err, fields, file) => {
        if (err) {
          console.error('Error', err)
          throw err
        }
        if(file && file.file){
            console.log('Fields', fields);
            console.log('File', file);
            let results = [];
            fs.createReadStream(file.file.path)
                .pipe(csv())
                .on('headers', (headers) => {
                    console.log(`Headers: ${headers}`)
                })
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log(`${results.length} rows parsed.`);
                })
            res.end(JSON.stringify({
                code : 0,
                msg : `File ${file.file.name} uploaded as ${file.file.path}.`
            },2,null));
        }else{
            res.end(JSON.stringify({
                code : 1,
                msg : "Upload Cancelled"
            },2,null));
        }
    })
});

module.exports = router;