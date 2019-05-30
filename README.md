# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)
3. [Develop Simple on HANA Express in AWS Cloud 9 Part 3 – The Frontend App](https://blogs.sap.com/?p=820837&preview=true&preview_id=820837)
4. [Develop Simple on HANA Express in AWS Cloud 9 Checkpoint – How to Catch Up/Restart](https://blogs.sap.com/2019/05/21/develop-simple-on-hana-express-in-aws-cloud-9-checkpoint-how-to-catch-uprestart/)
5. [Develop Simple on HANA Express in AWS Cloud 9 - An HDI Container inside... a Docker Container?](https://blogs.sap.com/2019/05/29/develop-simple-on-hana-express-in-aws-cloud-9-an-hdi-container-inside-a-docker-container/)
6. [Develop Simple on HANA Express in AWS Cloud 9 - Housekeeping with our DB and Backend app]()

### Github Repository for this part:
https://github.com/entmike/hanadev/tree/PartAuth

# Overview

I know in the last part I mentioned I'd cover the CRUD DB operations, however we must first to a little house-keeping and a little re-factoring to prepare our project.  This Part will cover primarily:

  - Enabling HXE Tenant DB with HDI and Document Store functionality
  - Splitting our HANA Express Volumes up between
    - development for active developing in Cloud 9
    - production(ish) for use/testing for our docker compose stack
  - Creating a few additional HDI container artifacts and a new application user that our backend app will run as
  - Allow our backend app to use a `.env` variable so it can run outside of a Docker container and live inside of Cloud 9 IDE

## Prerequisites

[Develop Simple on HANA Express in AWS Cloud 9 - An HDI Container inside... a Docker Container?](https://blogs.sap.com/2019/05/29/develop-simple-on-hana-express-in-aws-cloud-9-an-hdi-container-inside-a-docker-container/) completed.

## Get another DB Script

I've added another DB Script, run the following commands to add it to your project:

```bash
cd ~/environment/hanadev/db-scripts
wget https://entmike.github.io/hanadev/db-scripts/grant-role.sql
wget https://entmike.github.io/hanadev/db-scripts/grantRole.sql
```

These files will allow us to grant a Role that we will create later to a HANA DB Application User that we will also be creating for our backend application.

## Create a Development volume for HANA Express

We've currently run HANA Express as a single Docker Container and as a Container in our Docker-Compose Stack.  Both have been using the same `/hana/mounts` volume.  It's time to break these apart into a "Development" and "Production(ish)" environment.  Luckily, this is quite easy to do with Containers!

1.  Create a `bootstrap_hxevolume.sh` file in `/hanadev` folder:

    ```bash
    #!/bin/bash
    
    docker run --rm --env-file=./.env \
        --name hxe \
        --hostname hxe \
        -v $1:/hana/mounts \
        -v $HOME/environment/hanadev/db-scripts:/scripts \
        store/saplabs/hanaexpress:2.00.036.00.20190223.1 \
        --agree-to-sap-license \
        --master-password $2
    ```

    This script will accept 2 parameters:
    
    1. The first parameter is the name of the Docker Volume for the container.
    2. The second parameter is the master password for the HANA DB volume upon first startup.

2.  From Terminal, make the `bootstrap_hxevolume.sh` file executable

    ```bash
    chmod +x ~/environment/hanadev/bootstrap_hxevolume.sh
    ```
    
3.  Modify your `/hanadev/runhxe.sh` script to the following:
    
    ```bash
    #!/bin/bash

    docker run --rm --env-file=./.env \
        --name hxe \
        --hostname hxe \
        -v $1:/hana/mounts \
        -p 39017:39017 \
        -p 39041:39041 \
        store/saplabs/hanaexpress:2.00.036.00.20190223.1
    ```
    
    We've changed the `/hana/mounts` volume to accept an argument for a Docker Volume.  This will now allow us the ability to run multiple versions of HANA Express DB volumes easily.

4. In a Terminal, from `/hanadev`, run:
    
    ```bash
    ./bootstrap_hxevolume.sh hxedev HXEHana1
    ```

    Since this is creating a new HANA Database in a new Docker Volume called `hxedev`, this will take about 5-7 minutes, so grab a coffee.
    
    When you get to the following point in your Terminal, you can kill the Container by pressing **`Control + C`**:
    
    ```
    
    ...
    
        HANA startup: 44s
        (Post start) Tenant creation: 265s
        (Post start) License import: 0s
        (Post start) Hook /hana/hooks/post_start/201_hxe_optimize: 8s
        (Post start) Hook /hana/hooks/post_start/203_set_hxe_info: 0s
        Post start: 277s
        Overall: 411s
    Ready at: Thu May 30 15:38:21 UTC 2019
    Startup finished!
    ```
    
5. With the Docker Volume bootstrapping complete, run the following command in Terminal to test out our updated `runhxe.sh` script:
    
    ```bash
    ./runhxe.sh hxedev
    ```

    This time, the container should start up in about 45-60 seconds.  If you've been following along in this series, you should now technically have 2 Docker Volumes for use in HANA Express:
    
    - `hanadev_hana-express` - This is the volume generated via the definition in our `docker-compose.yaml` file early on in the series.  We'll consider this a 'production-ish' volume.
    
    - `hxedev` - Our 'development' volume that we can use to seperate out our development without impacting our docker stack's 'production-ish' HANA Express volume.
    
    At any point, you can always check how many Docker Volumes you have in your Cloud 9 environment by typing:
    
    ```bash
    docker volume ls
    ```
    
    *Example Response:*
    
    ```
    DRIVER              VOLUME NAME
    local               hanadev_hana-express
    local               hanadev_sqlpad
    local               hxedev
    ```
    
    *Also, (***and don't do this right now***) if you ever want to delete a Docker Volume because you messed up or want a clean slate, you can do so by typing `docker volume rm hxedev` for example.  At that point, you'd go back and run the `bootstrap_hxevolume.sh` script and let it recreate the volume.*
    
6. With the Container still running, open a second Terminal window and run the following:

    ```bash
    docker exec -ti hxe /scripts/enableHDI.sh SYSTEM HXEHana1 HXEHana1
    docker exec -ti hxe /scripts/createContainer.sh HXEHana1 HDI_HELLO_WORLD SYSTEM HXEHana1
    docker exec hxe /usr/sap/HXE/HDB90/exe/hdbsql -i 90 -d HXE -u SYSTEM -p HXEHana1 "CREATE USER HELLO_WORLD_AUTH_MGR PASSWORD HXEHana1 NO FORCE_FIRST_PASSWORD_CHANGE;"
    ```
    
    As described in the previous part of the series, these 3 commands will:
    
      1. Enable HDI and Document Store in our HXE Tenant DB
      3. Create an HDI container for our application.
      2. Create our Hello World Authorization Manager application user.
      
## Create a User Store Collection and Role in our hdi-hello-world-db

We will need to put some application authentication in place for our app, since we do not just want random, anonymous users creating ToDo List entries in our app.

1. Create a file called `Users.hdbcollection` under `hanadev/hello-world-app/hdi-hello-world-db/src` with the following contents:
    
    ```
    COLLECTION TABLE "USERS"
    ```

2. Create a file called `AuthorizationManager.hdbrole` under `hanadev/hello-world-app/hdi-hello-world-db/src`.  This role will be assigned to an Application User that our backend API will run as.  Paste in the following contents:

    ```json
    {
        "role" : {
            "name" : "AuthorizationManager",
            "object_privileges" : [
                {
                    "name" : "USERS",
                    "type" : "TABLE",
                    "privileges" : [ "SELECT", "DELETE", "INSERT", "UPDATE" ]
                }
            ]
        }
    }
    ```

3. With your `hxedev` volume running in a Docker Container still (*`runhxe.sh hxedev`*), in another Terminal window, run the following:

    ```bash
    cd ~/environment/hanadev/hello-world-app/hdi-hello-world-db
    npm run start
    ```
    
    You should see that we now have 3 HANA DB artifacts in the terminal output:
    
    ```
    ...
    
       Processing work list... 
        Deploying "src/TodoList.hdbtable"... 
        Deploying "src/Users.hdbcollection"... 
        Deploying "src/TodoList.hdbtable"... ok  (0s 798ms)
        Deploying "src/Users.hdbcollection"... ok  (0s 829ms)
        Deploying "src/AuthorizationManager.hdbrole"... 
        Deploying "src/AuthorizationManager.hdbrole"... ok  (0s 66ms)
       Processing work list... ok  (0s 602ms)
       Finalizing... 
        Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... 
        Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... ok  (0s 13ms)
       Finalizing... ok  (0s 256ms)
       Make succeeded (0 warnings): 4 files deployed (effective 4), 0 files undeployed (effective 0), 0     dependent files redeployed 
      Making... ok  (1s 858ms)
     Starting make in the container "HDI_HELLO_WORLD" with 4 files to deploy, 0 files to undeploy... ok  (1s     882ms)
    Deploying to the container "HDI_HELLO_WORLD"... ok (2s 31ms)
    No default-access-role handling needed; global role "HDI_HELLO_WORLD::access_role" will not be adapted
    Unlocking the container "HDI_HELLO_WORLD"...
    Unlocking the container "HDI_HELLO_WORLD"... ok (0s 1ms)
    Deployment to container HDI_HELLO_WORLD done [Deployment ID: none].
    (2s 802ms)
    ```

4. Next, let's grant our `HELLO_WORLD_AUTH_MGR` Application User the role `AuthorizationManager` using our `grantRole.sh` script:
    
    ```bash
    docker exec -ti hxe /scripts/grantRole.sh HDI_HELLO_WORLD AuthorizationManager HELLO_WORLD_AUTH_MGR HDI_HELLO_WORLD_USER_DT HXEHana1
    ```

    To summarize what this script does, it accepts the following parameters in the order they appear below:
    
    | Parameter | Description | Example |
    | --------- | ----------- | ------- |
    | Target Schema | HDI managed Schema we want to grant some access in | `HDI_HELLO_WORLD` |
    | Role | Role we are granting in the target schema | `AuthorizationManager` |
    | Grantee | User we are granting access to | `HELLO_WORLD_AUTH_MGR` |
    | Grantor | HDI Container Owner who can perform the grant | `HDI_HELLO_WORLD_USER_DT` |
    | Grantor Password | Password of the HDI Container Owner | `HXEHana1` |

5. Confirm that your user has received the authorizations:
    
    ```
    | REQUEST_ID           | ROW_ID               | LEVEL       | TYPE    | LIBRARY_ | PLUGIN_I | PATH     | SEVE | MESSAGE_CODE         | MESSAGE                                                                                                                              | LOC | LOCATION | TIMESTAMP_UTC                 |
    | -------------------- | -------------------- | ----------- | ------- | -------- | -------- | -------- | ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ----------------------------- |
    |                   11 |                    1 |           0 | HDI     |          |          |          | INFO |              8214219 | Granting schema roles in the container "HDI_HELLO_WORLD" and the parameters "[]"...                                                  | 0:0 |          | 2019-05-30 20:07:36.580000900 |
    |                   11 |                    2 |           1 | HDI     |          |          |          | INFO |              8214229 | Granting the schema role "AuthorizationManager" to the principal "HELLO_WORLD_AUTH_MGR" in the schema "" with grant option = "false" | 0:0 |          | 2019-05-30 20:07:36.582000900 |
    |                   11 |                    3 |           0 | SUMMARY |          |          |          | INFO |              8214220 | Granting schema roles in the container "HDI_HELLO_WORLD" and the parameters "[]"... ok                                               | 0:0 |          | 2019-05-30 20:07:36.631000900 |
    ```

## Update backend app to run as our new application user

We now will return to our lonely `backend` application that we started way back in Part 2.  At that time, we technically ran as a `SYSTEMDB` user that we called `APPUSER` for that simple example.  This time, we want to use the `HXE` tenant DB and use our new user named `HELLO_WORLD_AUTH_MGR`.

1. Create (or modify) the `.env` file under `hanadev/hello-world-app/backend` with the following contents:

    ```
    HANA_SERVERNODE=localhost:39041
    HANA_UID=HELLO_WORLD_AUTH_MGR
    HANA_PWD=HXEHana1
    ```
    
    Note that not only are we using our new user, but also the port has changed to `39041`, which is the HXE tenant DB that we will now be using for our backend.

2. In order to let our backend app use this `.env` file easily, let's install a popular npm package called [dotenv](https://www.npmjs.com/package/dotenv).  We are also going to do a little housekeeping and locally (instead of globally) instal `@sap/hana-client`.  From a Terminal, type:

    ```bash
    cd ~/environment/hanadev/hello-world-app/backend
    npm i dotenv @sap/hana-client
    ```
3. Open the `server.js` file in the `backend` folder add the following line after your other `require` statements:

    ```javascript
    require('dotenv').config();
    ```

4. Next, let's see if we can now run our `backend` module in Cloud 9 (rather than in the entire Docker Compose Stack as we did previously.)  Run the following statement:
    
    ```bash
    npm run prod
    ```
    
    You should now get some Terminal feedback indicating that your backend module is running in Cloud 9:

    ```
    > backend@1.0.0 prod /home/ec2-user/environment/hanadev/hello-world-app/backend
    > node server.js
    
    Server started on port 8080
    ```

5. Let's check that our app is in-fact using the new `.env` variable by running the following command in a second Terminal window (with your HANA Container with `hxedev` volume is still running):
    
    ```bash
    curl -X POST http://localhost:8080/api/overview
    ```

    You should get the similar JSON output, however near the top of the output for `backend_information` we should see new information:
    
    ```json
      {
      "backend_information": {
        "server": "localhost:39041",
        "user": "HELLO_WORLD_AUTH_MGR"
      },
      ...
    ```
    
    Congratulations!  We have done some DB housekeeping and `backend` module housekeeping to prepare our project for the next section with will cover user authentication for our CRUD operations in our To-Do Application.
