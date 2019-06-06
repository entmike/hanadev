const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const requiredEnv = require('./requiredEnv');
const server = require('http').Server(app);
const io = require('socket.io')(server);
require('dotenv').config();

const port = process.env.BACKEND_PORT || 9999;
process.env.BACKEND_PASSWORD = process.env.BACKEND_PASSWORD || `Admin1234`;
server.listen(port, ()=>{
    console.log(`Backend Server started on port ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : true
}));

io.on('connection', function(socket){
  console.log(socket);
  socket.on('setupapp', require('./sockets/setupapp')(io));
  socket.on('disconnect', data=>{
      console.log('Connection terminated.');
  });
});

// Start up core services that can run without HANA DB
app.use(require('./api/app'));

let missing = [];
for(let field in requiredEnv) if(!process.env[field]) missing.push({field:field,desc:requiredEnv[field]});

if(missing.length>0) {
    let message = 'The following required environment variables are missing:\n\n';
    missing.map(f=>{
       message+=`  - ${f.field}\t${f.desc}\n`;
    });
    console.warn(message);
}else{
    // Setup HANA DB services
    app.use(require('./api/db'));
    console.log(`Communicating as ${process.env.HANA_UID} to HANA Server Node ${process.env.HANA_SERVERNODE}`);
}