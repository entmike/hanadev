# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)

# Overview
In the second part of this series, I'm covering how to create a simple backend NPM module that will run inside of a container and be added to our Docker Compose stack from the first part of the series.  The end result will be the ability to issue an http POST call that is routed with the Node `express` npm module and get back some system metadata about the HANA Express instance.  The Express routing will serve as a framework for similar API calls we will write in further parts of the series.  Also in further parts, we will write Vue frontend web app to consume these calls and show in a web browser.

## Prerequisites

- Cloud 9 set up and configured as described in [Part 1](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)

# Update the docker-compose directory with a .env file

1. Launch Cloud 9 IDE, and click the Gear button next to the root folder of your workspace.  Click **Show Hidden Files**
2. Right-click your `/hanadev` folder and add a new file called `.env`.  Open the file and put the following contents:
    
    ```
    HXE_MASTER_PASSWORD=YourPasswordFromPart1
    HANA_SERVER=hxehost:39017
    HANA_UID=SYSTEM
    ```
    
    This will serve 2 purposes:
    1. This will allow you to not have to set your enviornment variable manually or pass it via command-line each time your Cloud 9 IDE spins down and back up.
    2. The additional environment variables (along with `HXE_MASTER_PASSWORD`) will serve as parameters for our backend app we will be writing next.

# Add one global NPM module to your Cloud 9 IDE
In order to connect to SAP HANA from Node, we need to use `@sap/hana-client` npm module.  However, we cannot simply do a normal `npm install @sap/hana-client`, because SAP has to make it a little harder and they've opted to host it on their own npm server, so type the following 2 commands from a Terminal window:

```bash
npm config set @sap:registry https://npm.sap.com
npm i -g @sap/hana-client
```
**Note** We are installing this NPM module globally because in my experience, this is a problematic library to place inside your own NPM package when copying entire folders from one environment to another.  This is because:

1. The fact that you have to remember to set the registry to SAP's npm box when doing an `npm install` on a new development box if you are cloning a project.
2. If you bounce around systems (Windows, to Cloud9 (Linux), to Mac (Darwin)), the architectures are different which means you do NOT want to inadvertantly copy the entire `node_modules` from your repository because technically the `npm install @sap/hana-client` does a bunch of compiling at that point and you'll get a mismatch if you change OS types.
3. I am overlooking some other elegant reason that would get around this issue that someone can clue me in on.

But I digress, just install it globally to humor me :)

# Creating a NPM module for our backend

We will be structuring each subsequent piece of our growing application inside the `hanadev` directory.

1. In your `hanadev` folder, create a new folder called `hello-world-app`.
2. In your `hello-world-app` folder, create another folder called `backend`.  This will be our location for our backend module.
2. From a Terminal, cd to the `hello-world-app/backend` directory, and type `npm init` and take all the default options (just keep pressing Enter) when prompted.
3. Next, we will need to install following module for our backend app by typing the following:

    ```bash
    npm i express cors body-parser
    ```
    
4. In your file browser in Cloud 9, you should now have a few new folders and files under `/hanadev/hello-world-app/backend`.  Open the `package-json` file and modify the `scripts` section to say:
    
    ```json
    "scripts": {
      "prod": "node server.js"
    },
    ```
    
    For example, your `package.json` should now look similar to this:
    
    ```
    {
      "name": "backend",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "prod": "node server.js"
      },
      "author": "",
      "license": "ISC",
      "dependencies": {
        "body-parser": "^1.19.0",
        "cors": "^2.8.5",
        "express": "^4.17.0"
      }
    }
    ```
    
5. In the `hello-world-app/backend` folder, create a `server.js` file which will serve as our entry point for our backend service routing.  Paste in the following code:

    ```javascript
    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const hana = require('@sap/hana-client');
    
    const port = process.env.PORT || 9999;
    
    if(!process.env.HANA_SERVERNODE
        || !process.env.HANA_PWD || !process.env.HANA_UID) {
        console.error(`Set the following environment variables:
        HANA_SERVERNODE\tYour HANA hostname:port
        HANA_UID\tYour HANA User
        HANA_PWD\tYour HANA Password`);
    }else{
        let overviewRouter = require('./api/overview');
        app.use('/api/overview', overviewRouter);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended : true
        }));
        
        app.listen(port, ()=>{
            console.log(`Server started on port ${port}`);
        });
    }
    ```
    
    So what is this doing?  Basically we are including a few common libraries and setting up a simple Express server that has one route waiting for requests on `/api/overview`.
    
6. Let's add one more file.  First, create a `api` folder inside of `hello-world-app/backend`.  Inside that `api` folder, create a file called `overview.js`.  Paste in the following contents:

    ```javascript
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
    ```
    
    In summary, this code will return some JSON that says what HANA user this code is running as, and some information about the HANA System by querying the `M_SYSTEM_OVERVIEW` table.
    
    Ok!  Coding is done.  Now how do we run this?

# Make our new Docker Image for our App

Since we (ok I) want to containerize this application into a self-contained stack, we cannot simply run `npm run prod`.  This is because in our development environment, we've put HANA Express in a container that is only aware of its own Docker Compose network.  This is the nature and beauty of containerization so what we need to do is add our backend application to our stack.  So let's do this now.

1. Inside of our `hello-world-app` folder, create a file called `Dockerfile`.  Paste in the following contents:

    ```dockerfile
    # Docker Image containing SAP HANA npm package
    FROM node:8-slim
    
    LABEL Maintainer="Your Name <your.name@example.com>"
    
    # Add SAP HANA Client NPM package from SAP's npm repository
    RUN npm config set @sap:registry https://npm.sap.com && npm i -g @sap/hana-client
    
    # Set the global NPM path Environment variable
    ENV NODE_PATH /usr/local/lib/node_modules
    COPY /hello-world-app /app
    WORKDIR /app
    CMD npm run prod
    ```
    
    Basically what this Dockerfile is doing is taking Node's `node:8-slim` Docker image and adding a few small things to it, making it our own new Docker image that we will add to our Stack in a moment.  The additions include:
    
    - Configuring the SAP NPM Repository reference and installing `@sap/hana-client` also globally (as we did in our Cloud 9 development box.)
    - Since we are using a global module, we are setting the `NODE_PATH` enviornment variable so that Node knows where the global npm packages are.
    - Copy the contents of our `hello-world-app` files over to the image under `/app`
    - Change the container's starting work directory to `/app` and set the starting container command to `npm run prod`.

# Add our Docker Image to our Stack

Now that we have our Docker Image defined for our container, we need to add it to our Docker Compose stack so that it can communicate with the HANA Express database.

1. Open the `docker-compose.yaml` file under `/hanadev` directory and update the contents to be this:

    ```yaml
    version: '2'
        
    services:
        
      hello-world-app:
        build: 
          context: .
          dockerfile: ./hello-world-app/Dockerfile
        ports:
          - "3333:9999"
        environment:
          - HANA_UID=${HANA_UID}
          - HANA_PWD=${HXE_MASTER_PASSWORD}
          - HANA_SERVERNODE=${HANA_SERVER} 
    
      sqlpad:
        image: sqlpad/sqlpad
        ports:
          - "8899:3000"
              
      hxehost:
        image: store/saplabs/hanaexpress:2.00.036.00.20190223.1
        hostname: hxe
        volumes:
          - hana-express:/hana/mounts
        command: --agree-to-sap-license --master-password ${HXE_MASTER_PASSWORD}
        
    volumes:
      hana-express:
    ```

Basically what we've added is a 3rd service/container called `hello-world-app`.  Since this will be based on a docker image build that we've not necessarily published (or even ever done a `docker build` on), we are defining it as its own `build`, rather than with an `image`.  You can see in the yaml that we are pointing the build context to our current directory (`hanadev`) and specifying the Dockerfile to the subdirectory (`hello-world-app`) where our Dockerfile and source code are located.

This definition basically tells Docker Compose that we want to build our image for this Stack.  Once our image is less prone to changes, we can always redefine this yaml to point to a finalized Docker Image with a tag name, etc at a later time.

# Running and Testing
1. To run our updated Docker Compose Stack, we can run the following command from the `hanadev` directory:

    ```bash
    docker-compose build && docker-compose up
    ```
    **Note** In theory, you should be able to just type `docker compose up`, however I experienced fits where Docker Compose would not always automatically rebuild the image as I was incrementally making changes to my Dockerfile and source files.  Basically I follow the rule of thumb where if I know I've changed the source and/or the app's Dockerfile (image), then I just do `docker-compose build` first.
    
    What you should now see after a minute or 2 of console spam is something like this at the end (as the hxehost container will be the last to spin up):
    
    ```bash
    hxehost_1          |     (Pre start) Hook /hana/hooks/pre_start/320_config_cert: 0s
    hxehost_1          |     (Pre start) Hook /hana/hooks/pre_start/330_custom_afls: 0s
    hxehost_1          |     Pre start: 0s
    hxehost_1          |     HANA startup: 62s
    hxehost_1          |     (Post start) Hook /hana/hooks/post_start/201_hxe_optimize: 0s
    hxehost_1          |     (Post start) Hook /hana/hooks/post_start/203_set_hxe_info: 0s
    hxehost_1          |     Post start: 0s
    hxehost_1          |     Overall: 64s
    hxehost_1          | Ready at: Fri May 17 18:34:09 UTC 2019
    hxehost_1          | Startup finished!
    ```
    
2.  Leaving this Terminal window open, open a second Terminal window in Cloud 9 and type the following command:

    ```bash
    curl -X POST http://localhost:3333/api/overview
    ```
    
    What you should get back is some JSON from our backend app:

    ```json
    {
      "backend_information": {
          "server": "hxehost:39017",
          "user": "SYSTEM"
      },
      "M_SYSTEM_OVERVIEW": [
        {
          "KEY": "Instance ID",
          "VAL": "HXE"
        },
        {
          "KEY": "Instance Number",
          "VAL": "90"
        },
        {
          "KEY": "Distributed",
          "VAL": "No"
        },
        {
          "KEY": "Version",
          "VAL": "2.00.036.00.1547699771 (fa/hana2sp03)"
        },
        {
          "KEY": "Platform",
          "VAL": "SUSE Linux Enterprise Server 12 SP2"
        },
        {
          "KEY": "All Started",
          "VAL": "No"
        },
        {
          "KEY": "Min Start Time",
          "VAL": "2019-05-17 18:24:57.583"
        },
        {
          "KEY": "Max Start Time",
          "VAL": "2019-05-17 18:24:57.583"
        },
        {
          "KEY": "Memory",
          "VAL": "Physical 7.79 GB, Swap 0.48 GB, Used 1.05"
        },
        {
          "KEY": "CPU",
          "VAL": "Available 2, Used -0.02"
        },
        {
          "KEY": "Data",
          "VAL": "Size 19.5 GB, Used 14.2 GB, Free 27 %"
        },
        {
          "KEY": "Log",
          "VAL": "Size 19.5 GB, Used 14.2 GB, Free 27 %"
        },
        {
          "KEY": "Trace",
          "VAL": "Size 19.5 GB, Used 14.2 GB, Free 27 %"
        },
        {
          "KEY": "Alerts",
          "VAL": "2 High, "
        }
      ]
    }
    ```
    
    If you made it this far, congratulations!  You've created a containerized backend service application that we'll build out and use to feed a prettier web front end.  And, since it's containerized, you'll be able to deploy easily on anything running Docker!  (Well, besides a Raspberry Pi, dang ARM architecture....)
    
    Stay tuned for the next part where we shift gears briefly to get the frontend up and running and test this same backend call and put a UI on top of it.