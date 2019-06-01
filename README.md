# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)
3. [Develop Simple on HANA Express in AWS Cloud 9 Part 3 – The Frontend App](https://blogs.sap.com/?p=820837&preview=true&preview_id=820837)
4. [Develop Simple on HANA Express in AWS Cloud 9 Checkpoint – How to Catch Up/Restart](https://blogs.sap.com/2019/05/21/develop-simple-on-hana-express-in-aws-cloud-9-checkpoint-how-to-catch-uprestart/)
5. [Develop Simple on HANA Express in AWS Cloud 9 - An HDI Container inside... a Docker Container?](https://blogs.sap.com/2019/05/29/develop-simple-on-hana-express-in-aws-cloud-9-an-hdi-container-inside-a-docker-container/)
6. [Develop Simple on HANA Express in AWS Cloud 9 - Housekeeping with our DB and Backend app](https://blogs.sap.com/2019/05/30/develop-simple-on-hana-express-in-aws-cloud-9-housekeeping-with-our-db-and-backend-app/)

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

## Move db-script administrative scripts to Node

```bash
curl -d '{ "tenantDB" : "HXE", "hdiAdminPassword" : "HXEHana1", "systemPassword" : "HXEHana1", "systemDBServerNode" : "localhost:39017" }' -H 'Content-Type: application/json' -X POST http://localhost:8080/api/setup
```

curl -d '{ "tenantDB" : "HXE", "hdiAdminPassword" : "HXEHana1", "systemPassword" : "HXEHana1", "systemDBServerNode" : "hxehost:39017" }' -H 'Content-Type: application/json' -X POST http://localhost:8080/admin/api/setup

curl -d '{ "authUser" : "SYSTEM", "authPassword" : "HXEHana1", "user" : "HELLO_WORLD_AUTH_MGR", "userPassword" : "HXEHana2!", "dbServerNode" : "localhost:39041" }' -H 'Content-Type: application/json' -X POST http://localhost:9090/api/createUser