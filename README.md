# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)
3. [Develop Simple on HANA Express in AWS Cloud 9 Part 3 – The Frontend App](https://blogs.sap.com/?p=820837&preview=true&preview_id=820837)
4. [Develop Simple on HANA Express in AWS Cloud 9 Checkpoint – How to Catch Up/Restart](https://blogs.sap.com/2019/05/21/develop-simple-on-hana-express-in-aws-cloud-9-checkpoint-how-to-catch-uprestart/)
5. [Develop Simple on HANA Express in AWS Cloud 9 - An HDI Container inside... a Docker Container?](https://blogs.sap.com/2019/05/29/develop-simple-on-hana-express-in-aws-cloud-9-an-hdi-container-inside-a-docker-container/)

### Github Repository for this part:
https://github.com/entmike/hanadev/tree/PartHDI

# Overview
It occured to me before going further with our app we started in Part 2 and Part 3, I needed to address one topic, DB artifact creation.  In the "old days", we'd use XS Classic repository to manage our DB Catalog object, however that was replaced with HDI/XSA (oft used synonymously, for right or wrong.)  Well, now SAP would say use Cloud Foundry on SCP to do it or bla bla bla who knows what in another year, right?  Well in the spirit of creating a lean/simple app (and not resorting to the obvious (and tempting) `CREATE COLUMN TABLE` statements), I set forth in seeing if I could use HDI-managed schemas in our bizzaro containerized Docker Stack.  So, in this part of the series, I will cover creating an HDI Container in our HANA Express Container without XSA.  All in AWS Cloud 9.  No installation of anything on your PC needed, as always.

I must say many thanks to Thomas Jung's [post here](https://blogs.sap.com/2019/04/16/developing-with-hana-deployment-infrastructure-hdi-without-xsacf-or-web-ide/comment-page-1/#comment-461218).  Without his clever blog and expertise, this would not have been possible for me.

## Prerequisites

- Follow Parts 1 through 3 in the Series, or catch up quickly [here](https://blogs.sap.com/2019/05/21/develop-simple-on-hana-express-in-aws-cloud-9-checkpoint-how-to-catch-uprestart/)

## Add some DB Support Files

In this section, we'll copy over some supporting script files based off of the helpful blog from Thomas Jung that he wrote about on the SAP Community Blogs that you can read about here:

https://blogs.sap.com/2019/04/16/developing-with-hana-deployment-infrastructure-hdi-without-xsacf-or-web-ide/

The SQL and script files have been slightly modified to work in our containerized HANA Express environment, however the majority of the code is courtesty of Thomas Jung.

1. From a Terminal window, type the following to quickly copy the files:

    ```bash
    cd ~/environment/hanadev/
    wget https://entmike.github.io/hanadev/runhxe.sh
    chmod +x runhxe.sh
    mkdir db-scripts
    cd db-scripts
    wget https://entmike.github.io/hanadev/db-scripts/create_container.sql
    wget https://entmike.github.io/hanadev/db-scripts/drop_container.sql
    wget https://entmike.github.io/hanadev/db-scripts/enable-hdi.sql
    wget https://entmike.github.io/hanadev/db-scripts/createContainer.sh
    wget https://entmike.github.io/hanadev/db-scripts/dropContainer.sh
    wget https://entmike.github.io/hanadev/db-scripts/enableHDI.sh
    chmod +x createContainer.sh
    chmod +x dropContainer.sh
    chmod +x enableHDI.sh
    ```

2. Next, we need to start our HANA Express container.  (Not the whole Docker Compose Stack) In a second Terminal Window, type the following:
    
    ```bash
    ~/environment/hanadev/runhxe.sh
    ```

    This command will start up just your HANA Express DB container and expose port `39017` and `39041` to your Cloud 9 environment, as well as map the container's `/scripts` directory to your Cloud 9's `db-scripts` folder.  We are doing this so that we can demonstrate building an HDI container inside a Docker Container.
    
    Once you see the following lines indicating that HANA Express has finished starting, proceed to the next step.
    
    ```bash
    
    ...
    
        (Pre start) Hook /hana/hooks/pre_start/330_custom_afls: 0s
        Pre start: 0s
        HANA startup: 57s
        (Post start) Hook /hana/hooks/post_start/201_hxe_optimize: 1s
        (Post start) Hook /hana/hooks/post_start/203_set_hxe_info: 0s
        Post start: 1s
        Overall: 59s
    Ready at: Wed May 29 20:40:32 UTC 2019
    Startup finished!

    ```

3. In your first Terminal screen, type the following:
    
    ```bash
    docker exec -ti hxe /scripts/enableHDI.sh SYSTEM HXEHana1 HXEHana1
    docker exec -ti hxe /scripts/createContainer.sh HXEHana1 HDI_HELLO_WORLD SYSTEM HXEHana1
    ```
    
    The first command above will enable HDI in our HXE Tenant DB.    

    The second command, you should get a some feedback in your Terminal indicating that the Schema and privileges have been assigned:

    ```
    | REQUEST_ID           | ROW_ID               | LEVEL       | TYPE    | LIBRARY_ | PLUGIN_I | PATH     | SEVE | MESSAGE_CODE         | MESSAGE                                        | LOC | LOCATION | TIMESTAMP_UTC                 |
    | -------------------- | -------------------- | ----------- | ------- | -------- | -------- | -------- | ---- | -------------------- | ---------------------------------------------- | --- | -------- | ----------------------------- |
    |                  249 |                    1 |           0 | HDI     |          |          |          | INFO |              8214127 | Creating the container "HDI_HELLO_WORLD"...    | 0:0 |          | 2019-05-29 20:52:07.772000900 |
    |                  249 |                    2 |           0 | SUMMARY |          |          |          | INFO |              8214128 | Creating the container "HDI_HELLO_WORLD"... ok | 0:0 |          | 2019-05-29 20:52:08.772000900 |
    | REQUEST_ID           | ROW_ID               | LEVEL       | TYPE    | LIBRARY_ | PLUGIN_I | PATH     | SEVE | MESSAGE_CODE         | MESSAGE                                                                                                                                                                                                                          | LOC | LOCATION | TIMESTAMP_UTC                 |
    | -------------------- | -------------------- | ----------- | ------- | -------- | -------- | -------- | ---- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------- | ----------------------------- |
    |                  250 |                    1 |           0 | HDI     |          |          |          | INFO |              8214207 | Granting API privileges in the container "HDI_HELLO_WORLD" and the parameters "[]"...                                                                                                                                            | 0:0 |          | 2019-05-29 20:52:08.976000900 |
    |                  250 |                    2 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "CANCEL" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                           | 0:0 |          | 2019-05-29 20:52:08.976000900 |
    |                  250 |                    3 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "CONFIGURE_CONTAINER" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                              | 0:0 |          | 2019-05-29 20:52:08.989000900 |
    |                  250 |                    4 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "CONFIGURE_CONTAINER_PARAMETERS" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                   | 0:0 |          | 2019-05-29 20:52:08.994000900 |
    |                  250 |                    5 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "CONFIGURE_LIBRARIES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                              | 0:0 |          | 2019-05-29 20:52:09.600090000 |
    |                  250 |                    6 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "DELETE" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                           | 0:0 |          | 2019-05-29 20:52:09.280009000 |
    |                  250 |                    7 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GET_DEPENDENCIES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                 | 0:0 |          | 2019-05-29 20:52:09.340009000 |
    |                  250 |                    8 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GET_MAKE_GROUPS" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                  | 0:0 |          | 2019-05-29 20:52:09.410009000 |
    |                  250 |                    9 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GRANT_CONTAINER_API_PRIVILEGES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                   | 0:0 |          | 2019-05-29 20:52:09.530009000 |
    |                  250 |                   10 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GRANT_CONTAINER_API_PRIVILEGES_WITH_GRANT_OPTION" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false" | 0:0 |          | 2019-05-29 20:52:09.600009000 |
    |                  250 |                   11 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GRANT_CONTAINER_SCHEMA_PRIVILEGES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                | 0:0 |          | 2019-05-29 20:52:09.700009000 |
    |                  250 |                   12 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "GRANT_CONTAINER_SCHEMA_ROLES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                     | 0:0 |          | 2019-05-29 20:52:09.770009000 |
    |                  250 |                   13 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "LIST" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                             | 0:0 |          | 2019-05-29 20:52:09.830009000 |
    |                  250 |                   14 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "LIST_CONFIGURED_LIBRARIES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                        | 0:0 |          | 2019-05-29 20:52:09.900009000 |
    |                  250 |                   15 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "LIST_DEPLOYED" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                    | 0:0 |          | 2019-05-29 20:52:09.970009000 |
    |                  250 |                   16 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "LOCK" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                             | 0:0 |          | 2019-05-29 20:52:09.104000900 |
    |                  250 |                   17 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "MAKE" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                             | 0:0 |          | 2019-05-29 20:52:09.111000900 |
    |                  250 |                   18 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "MAKE_ASYNC" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                       | 0:0 |          | 2019-05-29 20:52:09.116000900 |
    |                  250 |                   19 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "READ" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                             | 0:0 |          | 2019-05-29 20:52:09.122000900 |
    |                  250 |                   20 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "READ_DEPLOYED" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                    | 0:0 |          | 2019-05-29 20:52:09.129000900 |
    |                  250 |                   21 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "REVOKE_CONTAINER_API_PRIVILEGES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                  | 0:0 |          | 2019-05-29 20:52:09.135000900 |
    |                  250 |                   22 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "REVOKE_CONTAINER_SCHEMA_PRIVILEGES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"               | 0:0 |          | 2019-05-29 20:52:09.142000900 |
    |                  250 |                   23 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "REVOKE_CONTAINER_SCHEMA_ROLES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                    | 0:0 |          | 2019-05-29 20:52:09.147000900 |
    |                  250 |                   24 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "STATUS" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                           | 0:0 |          | 2019-05-29 20:52:09.151000900 |
    |                  250 |                   25 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "EXECUTE" on the object "WRITE" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.156000900 |
    |                  250 |                   26 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS_METADATA_CONTENT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                             | 0:0 |          | 2019-05-29 20:52:09.161000900 |
    |                  250 |                   27 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS_METADATA_CONTENT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                           | 0:0 |          | 2019-05-29 20:52:09.164000900 |
    |                  250 |                   28 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_MESSAGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                                  | 0:0 |          | 2019-05-29 20:52:09.168000900 |
    |                  250 |                   29 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_MESSAGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                                | 0:0 |          | 2019-05-29 20:52:09.171000900 |
    |                  250 |                   30 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_CONTAINER_EXPORT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                          | 0:0 |          | 2019-05-29 20:52:09.175000900 |
    |                  250 |                   31 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_CONTAINER_EXPORT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                        | 0:0 |          | 2019-05-29 20:52:09.178000900 |
    |                  250 |                   32 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_PARAMETERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                                | 0:0 |          | 2019-05-29 20:52:09.181000900 |
    |                  250 |                   33 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_PARAMETERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                              | 0:0 |          | 2019-05-29 20:52:09.185000900 |
    |                  250 |                   34 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_SCHEMA_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                         | 0:0 |          | 2019-05-29 20:52:09.188000900 |
    |                  250 |                   35 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_SCHEMA_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                       | 0:0 |          | 2019-05-29 20:52:09.192000900 |
    |                  250 |                   36 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_SCHEMA_ROLES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                              | 0:0 |          | 2019-05-29 20:52:09.196000900 |
    |                  250 |                   37 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_SCHEMA_ROLES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.199000900 |
    |                  250 |                   38 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_API_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.202000900 |
    |                  250 |                   39 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_API_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                          | 0:0 |          | 2019-05-29 20:52:09.205000900 |
    |                  250 |                   40 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                              | 0:0 |          | 2019-05-29 20:52:09.209000900 |
    |                  250 |                   41 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.212000900 |
    |                  250 |                   42 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS_CONTENT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                      | 0:0 |          | 2019-05-29 20:52:09.215000900 |
    |                  250 |                   43 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS_CONTENT" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                    | 0:0 |          | 2019-05-29 20:52:09.219000900 |
    |                  250 |                   44 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS_METADATA" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                     | 0:0 |          | 2019-05-29 20:52:09.222000900 |
    |                  250 |                   45 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS_METADATA" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                   | 0:0 |          | 2019-05-29 20:52:09.225000900 |
    |                  250 |                   46 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS_STATUS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                       | 0:0 |          | 2019-05-29 20:52:09.229000900 |
    |                  250 |                   47 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS_STATUS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                     | 0:0 |          | 2019-05-29 20:52:09.232000900 |
    |                  250 |                   48 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_FILESFOLDERS_PARAMETERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                   | 0:0 |          | 2019-05-29 20:52:09.236000900 |
    |                  250 |                   49 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_FILESFOLDERS_PARAMETERS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                 | 0:0 |          | 2019-05-29 20:52:09.239000900 |
    |                  250 |                   50 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_LIBRARY_CONFIGURATION" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                     | 0:0 |          | 2019-05-29 20:52:09.242000900 |
    |                  250 |                   51 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_LIBRARY_CONFIGURATION" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                   | 0:0 |          | 2019-05-29 20:52:09.245000900 |
    |                  250 |                   52 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_LIBRARY_INFORMATION" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                       | 0:0 |          | 2019-05-29 20:52:09.249000900 |
    |                  250 |                   53 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_LIBRARY_INFORMATION" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                     | 0:0 |          | 2019-05-29 20:52:09.252000900 |
    |                  250 |                   54 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_OBJECTS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                                   | 0:0 |          | 2019-05-29 20:52:09.255000900 |
    |                  250 |                   55 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_OBJECTS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                                 | 0:0 |          | 2019-05-29 20:52:09.259000900 |
    |                  250 |                   56 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_DEPENDENCIES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                              | 0:0 |          | 2019-05-29 20:52:09.262000900 |
    |                  250 |                   57 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_DEPENDENCIES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.266000900 |
    |                  250 |                   58 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "TT_MAKE_GROUPS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                               | 0:0 |          | 2019-05-29 20:52:09.269000900 |
    |                  250 |                   59 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_NO_MAKE_GROUPS" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                             | 0:0 |          | 2019-05-29 20:52:09.272000900 |
    |                  250 |                   60 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_DEFAULT_LIBRARIES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                          | 0:0 |          | 2019-05-29 20:52:09.276000900 |
    |                  250 |                   61 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_DEFAULT_COMMON_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                  | 0:0 |          | 2019-05-29 20:52:09.279000900 |
    |                  250 |                   62 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_DEFAULT_CONTAINER_USER_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                          | 0:0 |          | 2019-05-29 20:52:09.282000900 |
    |                  250 |                   63 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "CREATE TEMPORARY TABLE" on the object "<schema>" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                          | 0:0 |          | 2019-05-29 20:52:09.285000900 |
    |                  250 |                   64 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "M_JOBS" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                            | 0:0 |          | 2019-05-29 20:52:09.299000900 |
    |                  250 |                   65 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "M_MESSAGES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                        | 0:0 |          | 2019-05-29 20:52:09.302000900 |
    |                  250 |                   66 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "M_ROLES" in the schema "HDI_HELLO_WORLD#DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                                           | 0:0 |          | 2019-05-29 20:52:09.306000900 |
    |                  250 |                   67 |           1 | HDI     |          |          |          | INFO |              8214225 | Granting the API privilege "SELECT" on the object "T_DEFAULT_CONTAINER_ADMIN_PRIVILEGES" in the schema "_SYS_DI" to the principal "HDI_HELLO_WORLD_USER_DT" in the schema "" with grant option = "false"                         | 0:0 |          | 2019-05-29 20:52:09.309000900 |
    |                  250 |                   68 |           0 | SUMMARY |          |          |          | INFO |              8214208 | Granting API privileges in the container "HDI_HELLO_WORLD" and the parameters "[]"... ok                                                                                                                                         | 0:0 |          | 2019-05-29 20:52:09.313000900 |
    | REQUEST_ID           | ROW_ID               | LEVEL       | TYPE    | LIBRARY_ | PLUGIN_I | PATH     | SEVE | MESSAGE_CODE         | MESSAGE                                                                                                                        | LOC | LOCATION | TIMESTAMP_UTC                 |
    | -------------------- | -------------------- | ----------- | ------- | -------- | -------- | -------- | ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --- | -------- | ----------------------------- |
    |                  251 |                    1 |           0 | HDI     |          |          |          | INFO |              8214213 | Granting schema privileges in the container "HDI_HELLO_WORLD" and the parameters "[]"...                                       | 0:0 |          | 2019-05-29 20:52:09.386000900 |
    |                  251 |                    2 |           1 | HDI     |          |          |          | INFO |              8214227 | Granting the schema privilege "SELECT" to the principal "HDI_HELLO_WORLD_USER_RT" in the schema "" with grant option = "false" | 0:0 |          | 2019-05-29 20:52:09.391000900 |
    |                  251 |                    3 |           0 | SUMMARY |          |          |          | INFO |              8214214 | Granting schema privileges in the container "HDI_HELLO_WORLD" and the parameters "[]"... ok                                    | 0:0 |          | 2019-05-29 20:52:09.423000900 |
    | Object Owner            | Application User        |
    | ----------------------- | ----------------------- |
    | HDI_HELLO_WORLD_USER_DT | HDI_HELLO_WORLD_USER_RT |
    ```

    Congrats, you've created an HDI Container!  Let's put a quick table with some data out there next.

## Creating HDI Database Artifacts 

Next, we will create a super-simple Node module that will be responsible solely for telling the `diserver` in HANA Express to create some Database objects in our HDI Container.

1. In your `hanadev/hello-world-app` folder, create a new folder called `hdi-hello-world-db`.
2. Inside the `hdi-hello-world-db`, create a `package.json` file and paste in the following contents:
    
    ```json
    {
        "name": "deploy",
        "dependencies": {
            "@sap/hdi-deploy": "3.10.0"
        },
        "scripts": {
            "start": "node node_modules/@sap/hdi-deploy/deploy.js --auto-undeploy --exit"
        }
    }
    ```

    **Note:** This is a typical `package.json` file you might have seen SAP Web IDE create, with 2 additions:

   - `--auto-undeploy` that way if you remove/rename objects in the `src` folder, the container will clean up after itself.
   - `--exit` this lets the npm script end when done building instead of having to press `Control + C` at the end.

3. Next, in the `hdi-hello-world-db` folder, create a `default-env.json` file:
    
    ```json
    {
        "TARGET_CONTAINER": "hdi_hello_world_db",		
        "VCAP_SERVICES": {
		    "hana": [
			    {
				    "name": "hdi_hello_world_db",
				    "label": "hana",
				    "tags": [
					    "hana",
					    "database",
					    "relational"
				    ],
				    "plan": "hdi-shared",
				    "credentials": {
					    "schema": "HDI_HELLO_WORLD",
					    "hdi_password": "HXEHana1",
					    "tenant_name": "HXE",
					    "password": "HXEHana1",
					    "driver": "com.sap.db.jdbc.Driver",
					    "port": "39041",
					    "encrypt": false,
					    "db_hosts": [
						    {
							    "port": 39041,
							    "host": "localhost"
						    }
					    ],
					    "host": "localhost",
					    "hdi_user": "HDI_HELLO_WORLD_USER_DT",
					    "user": "HDI_HELLO_WORLD_USER_RT",
					    "url": "jdbc:sap://localhost:39041/?currentschema=HDI_HELLO_WORLD"
				    }
			    }
		    ]
	    }
    }
    ```

4. Inside the `hdi-hello-world-db`, create a `src` folder.
5. Inside the `src` folder, create a `.hdiconfig` folder and paste in the following:
    
    ```json
    {
        "plugin_version" : "2.0.36.0",
        "file_suffixes" : {
            "hdbcollection" : {
                "plugin_name" : "com.sap.hana.di.collection"
            },
            "hdbsystemversioning" : {
                "plugin_name" : "com.sap.hana.di.systemversioning"
            },
            "hdbsynonym" : {
                "plugin_name" : "com.sap.hana.di.synonym"
            },
            "hdbsynonymconfig" : {
                "plugin_name" : "com.sap.hana.di.synonym.config"
            },
            "hdbtable" : {
                "plugin_name" : "com.sap.hana.di.table"
            },
            "hdbdropcreatetable" : {
                "plugin_name" : "com.sap.hana.di.dropcreatetable"
            },
            "hdbvirtualtable" : {
                "plugin_name" : "com.sap.hana.di.virtualtable"
            },
            "hdbvirtualtableconfig" : {
                "plugin_name" : "com.sap.hana.di.virtualtable.config"
            },
            "hdbindex" : {
                "plugin_name" : "com.sap.hana.di.index"
            },
            "hdbfulltextindex" : {
                "plugin_name" : "com.sap.hana.di.fulltextindex"
            },
            "hdbconstraint" : {
                "plugin_name" : "com.sap.hana.di.constraint"
            },
            "hdbtrigger" : {
                "plugin_name" : "com.sap.hana.di.trigger"
            },
            "hdbstatistics" : {
                "plugin_name" : "com.sap.hana.di.statistics"
            },
            "hdbview" : {
                "plugin_name" : "com.sap.hana.di.view"
            },
            "hdbcalculationview" : {
                "plugin_name" : "com.sap.hana.di.calculationview"
            },
            "hdbprojectionview" : {
                "plugin_name" : "com.sap.hana.di.projectionview"
            },
            "hdbprojectionviewconfig" : {
                "plugin_name" : "com.sap.hana.di.projectionview.config"
            },
            "hdbresultcache" : {
                "plugin_name" : "com.sap.hana.di.resultcache"
            },
            "hdbcds" : {
                "plugin_name" : "com.sap.hana.di.cds"
            },
            "hdbfunction" : {
                "plugin_name" : "com.sap.hana.di.function"
            },
            "hdbvirtualfunction" : {
                "plugin_name" : "com.sap.hana.di.virtualfunction"
            },
            "hdbvirtualfunctionconfig" : {
                "plugin_name" : "com.sap.hana.di.virtualfunction.config"
            },
            "hdbhadoopmrjob" : {
                "plugin_name" : "com.sap.hana.di.virtualfunctionpackage.hadoop"
            },
            "jar" : {
                "plugin_name" : "com.sap.hana.di.virtualfunctionpackage.hadoop"
            },
            "hdbtabletype" : {
                "plugin_name" : "com.sap.hana.di.tabletype"
            },
            "hdbprocedure" : {
                "plugin_name" : "com.sap.hana.di.procedure"
            },
            "hdbvirtualprocedure" : {
                "plugin_name" : "com.sap.hana.di.virtualprocedure"
            },
            "hdbvirtualprocedureconfig" : {
                "plugin_name" : "com.sap.hana.di.virtualprocedure.config"
            },
            "hdbafllangprocedure" : {
                "plugin_name" : "com.sap.hana.di.afllangprocedure"
            },
            "hdblibrary" : {
                "plugin_name" : "com.sap.hana.di.library"
            },
            "hdbsequence" : {
                "plugin_name" : "com.sap.hana.di.sequence"
            },
            "hdbrole" : {
                "plugin_name" : "com.sap.hana.di.role"
            },
            "hdbroleconfig" : {
                "plugin_name" : "com.sap.hana.di.role.config"
            },
            "hdbstructuredprivilege" : {
                "plugin_name" : "com.sap.hana.di.structuredprivilege"
            },
            "hdbanalyticprivilege" : {
                "plugin_name" : "com.sap.hana.di.analyticprivilege"
            },
            "hdbtabledata" : {
                "plugin_name" : "com.sap.hana.di.tabledata"
            },
            "csv" : {
                "plugin_name" : "com.sap.hana.di.tabledata.source"
            },
            "properties" : {
                "plugin_name" : "com.sap.hana.di.tabledata.properties"
            },
            "tags" : {
                "plugin_name" : "com.sap.hana.di.tabledata.properties"
            },
            "hdbgraphworkspace" : {
                "plugin_name" : "com.sap.hana.di.graphworkspace"
            },
            "hdbflowgraph" : {
                "plugin_name" : "com.sap.hana.di.flowgraph"
            },
            "hdbreptask" : {
                "plugin_name" : "com.sap.hana.di.reptask"
            },
            "hdbsearchruleset" : {
                "plugin_name" : "com.sap.hana.di.searchruleset"
            },
            "hdbtextconfig" : {
                "plugin_name" : "com.sap.hana.di.textconfig"
            },
            "hdbtextdict" : {
                "plugin_name" : "com.sap.hana.di.textdictionary"
            },
            "hdbtextrule" : {
                "plugin_name" : "com.sap.hana.di.textrule"
            },
            "hdbtextinclude" : {
                "plugin_name" : "com.sap.hana.di.textrule.include"
            },
            "hdbtextlexicon" : {
                "plugin_name" : "com.sap.hana.di.textrule.lexicon"
            },
            "hdbtextminingconfig" : {
                "plugin_name" : "com.sap.hana.di.textminingconfig"
            },
            "txt" : {
                "plugin_name" : "com.sap.hana.di.copyonly"
            }
        }
    }
    ```
6. Inside the `src` folder, create a `TodoList.hdbtable` file:
    
    ```sql
    COLUMN TABLE "TodoList" (
      "TASKID" INTEGER CS_INT GENERATED BY DEFAULT AS IDENTITY (NO CYCLE NO CACHE NO MINVALUE START WITH 200000000 INCREMENT BY 1 MAXVALUE 2999999999) NOT NULL COMMENT 'To Do List ID',
      "CREATEDBY" NVARCHAR(10) COMMENT 'Created By',
      "CREATEDON" DATE CS_DAYDATE COMMENT 'Created Date',
      "TASK" TEXT COMMENT 'Task Description',
      "COMPLETE" VARCHAR(1) COMMENT 'Task Completed',
    PRIMARY KEY ("TASKID"))  COMMENT 'To-Do List'
    ```

7. Now, we are ready to build this TodoList table in our HDI container.  In a Terminal Window, type:

    ```bash
    cd ~/environment/hanadev/hello-world-app/hdi-hello-world-db
    npm i
    npm run start
    ```
    
    After a few seconds, you should have the following console output:

    ```bash
    > deploy@ start /home/ec2-user/environment/hanadev/hello-world-app/hdi-hello-world-db
    > node node_modules/@sap/hdi-deploy/deploy.js --auto-undeploy --exit
    
    @sap/hdi-deploy, version 3.10.0 (mode default), server version 2.00.036.00.1547699771 (2.0.36.0), node version 8.16.0, HDI version -1, container API version -1
    Detection of container API version failed; root cause: The server does not support container API version detection.
    Detection of HDI version failed; root cause: The server does not support HDI version detection.
    Using default environment variables from file "default-env.json"
    No ignore file at /home/ec2-user/environment/hanadev/hello-world-app/hdi-hello-world-db/.hdiignore.
    Collecting files...
    Collecting files... ok (0s 3ms)
    1 directories collected
    2 files collected
    0 reusable modules collected
    Target service: hdi_hello_world_db
    Session variable APPLICATION is set to "SAP_HDI//".
    Previous build with request ID 312 finished at 2019-05-29 21:36:26.764000900 with status Finished and message: Configuring libraries in the container "HDI_HELLO_WORLD"; removing []; updating or adding [com.sap.hana.di.afllangprocedure, com.sap.hana.di.analyticprivilege, com.sap.hana.di.calculationview, com.sap.hana.di.cds, com.sap.hana.di.collection, com.sap.hana.di.constraint, com.sap.hana.di.copyonly, com.sap.hana.di.dropcreatetable, com.sap.hana.di.flowgraph, com.sap.hana.di.fulltextindex, com.sap.hana.di.function, com.sap.hana.di.graphworkspace, com.sap.hana.di.index, com.sap.hana.di.library, com.sap.hana.di.logicalschema, com.sap.hana.di.procedure, com.sap.hana.di.projectionview, com.sap.hana.di.reptask, com.sap.hana.di.resultcache, com.sap.hana.di.role, com.sap.hana.di.searchruleset, com.sap.hana.di.sequence, com.sap.hana.di.statistics, com.sap.hana.di.structuredprivilege, com.sap.hana.di.synonym, com.sap.hana.di.systemversioning, com.sap.hana.di.table, com.sap.hana.di.tabledata, com.sap.hana.di.tabletype, com.sap.hana.di.textconfig, com.sap.hana.di.textdictionary, com.sap.hana.di.textminingconfig, com.sap.hana.di.textrule, com.sap.hana.di.trigger, com.sap.hana.di.view, com.sap.hana.di.virtualfunction, com.sap.hana.di.virtualfunctionpackage, com.sap.hana.di.virtualpackage, com.sap.hana.di.virtualprocedure, com.sap.hana.di.virtualtable]... ok.
    Processing revoke files...
    Processing revoke files... ok (0s 0ms)
    Processing grants files...
    Processing grants files... ok (0s 0ms)
    Preprocessing files...
    Preprocessing files... ok (0s 1ms)
    Connecting to the container "HDI_HELLO_WORLD"...
    Connecting to the container "HDI_HELLO_WORLD"... ok (0s 4ms)
    Locking the container "HDI_HELLO_WORLD"...
    Locking the container "HDI_HELLO_WORLD"... ok (0s 45ms)
    Synchronizing files with the container "HDI_HELLO_WORLD"...
    Synchronizing files with the container "HDI_HELLO_WORLD"... ok (0s 290ms)
    2 modified or added files are scheduled for deploy based on delta detection
    0 deleted files are scheduled for undeploy based on delta detection (filtered by undeploy whitelist)
    0 files are scheduled for deploy based on explicit specification
    0 files are scheduled for undeploy based on explicit specification
    Deploying to the container "HDI_HELLO_WORLD"...
     Starting make in the container "HDI_HELLO_WORLD" with 2 files to deploy, 0 files to undeploy... 
      Migrating libraries... 
      Migrating libraries... ok  (0s 8ms)
      Making... 
       Preparing... 
       Preparing the make transaction... 
       Deploying the configuration file "src/.hdiconfig"... 
       Deploying the configuration file "src/.hdiconfig"... ok  (0s 36ms)
       Adding "src/TodoList.hdbtable" for deploy... 
       Adding "src/TodoList.hdbtable" for deploy... ok  (0s 9ms)
       Preparing... ok  (0s 168ms)
       Preparing the make transaction... ok  (0s 175ms)
       Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... 
       Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... ok  (0s 3ms)
       Calculating dependencies... 
        Expanding... 
         Expanding "src/TodoList.hdbtable"... 
         Expanding "src/TodoList.hdbtable"... ok  (0s 6ms)
        Expanding... ok  (0s 29ms)
        Precompiling... 
         Precompiling "src/TodoList.hdbtable"... 
         Precompiling "src/TodoList.hdbtable"... ok  (0s 6ms)
        Precompiling... ok  (0s 14ms)
        Merging... 
        Merging... ok  (0s 16ms)
       Calculating dependencies... ok  (0s 100ms)
       Processing work list... 
        Deploying "src/TodoList.hdbtable"... 
        Deploying "src/TodoList.hdbtable"... ok  (0s 15ms)
       Processing work list... ok  (0s 22ms)
       Finalizing... 
        Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... 
        Checking the uniqueness of the catalog objects in the schema "HDI_HELLO_WORLD"... ok  (0s 15ms)
       Finalizing... ok  (0s 70ms)
       Make succeeded (0 warnings): 2 files deployed (effective 2), 0 files undeployed (effective 0), 0 dependent files redeployed 
      Making... ok  (0s 396ms)
     Starting make in the container "HDI_HELLO_WORLD" with 2 files to deploy, 0 files to undeploy... ok  (0s 410ms)
    Deploying to the container "HDI_HELLO_WORLD"... ok (0s 537ms)
    No default-access-role handling needed; global role "HDI_HELLO_WORLD::access_role" will not be adapted
    Unlocking the container "HDI_HELLO_WORLD"...
    Unlocking the container "HDI_HELLO_WORLD"... ok (0s 1ms)
    Deployment to container HDI_HELLO_WORLD done [Deployment ID: none].
    (1s 180ms)
    ```
    
    If you made it this far, congratulations!  You're a true believer! (and/or insane to be following along so far!)


# What's Next?

Stay tuned as we get weirder, because next, we will take our app that we started in Parts 2 and 3 and do some simple CRUD operations to our brand new shiny HDI Container to feed it some data.
