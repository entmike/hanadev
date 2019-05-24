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
    form.uploadDir = process.env.UPLOAD_DIR;
    form.parse(req, (err, fields, file) => {
        if (err) {
          console.error('Error', err)
          throw err
        }
        if(file && file.file){
            console.log('Fields', fields);
            console.log('File', file);
            let results = [];
            let metadata = {};
            fs.createReadStream(file.file.path)
                .pipe(csv())
                .on('headers', (headers) => {
                    for(let header of headers) metadata[header] = {
                        typeTest : {
                            float : true,
                            int : true,
                            // date : true,     // Too hard for me
                            boolean : true
                        }
                    };
                    console.log(`Headers: ${headers}`)
                })
                .on('data', (data) => {
                    for(let header in metadata){
                        let metaField = metadata[header];
                        let field = data[header];
                        let test = parseFloat(field);
                        // Boolean checks
                        if(field != undefined && (field.toLowerCase() != "true" && field.toLowerCase() != "false")){
                            metaField.typeTest.boolean = false;
                        }
                        // Numeric checks
                        let isNumber = !isNaN(parseFloat(field)) && !isNaN(field - 0)
                        if(!isNumber){
                            metaField.typeTest.float = false;
                            metaField.typeTest.int = false;
                        }else{
                            if(parseFloat(field) != parseInt(field)) metaField.typeTest.int = false;
                        }
                    }
                    results.push(data)
                })
                .on('end', () => {
                    for(let header in metadata){
                        let metaField = metadata[header];
                        let typeTest = metaField.typeTest;
                        metaField.type = "String";  // default
                        if(typeTest.float) metaField.type = "Float"
                        if(typeTest.float && typeTest.int) metaField.type = "Integer"
                        if(typeTest.boolean) metaField.type = "Boolean";
                        delete metaField.typeTest;
                    }
                    console.log(`${results.length} rows parsed.`);
                    console.log(metadata);
                    res.end(JSON.stringify({
                        code : 0,
                        msg : `File ${file.file.name} uploaded.  ${results.length} rows processed.`,
                        metadata : metadata
                    },2,null));
                })
        }else{
            res.end(JSON.stringify({
                code : 1,
                msg : "Upload Cancelled"
            },2,null));
        }
    })
});

module.exports = router;