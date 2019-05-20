# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)
3. [Develop Simple on HANA Express in AWS Cloud 9 Part 3 – The Frontend App](https://blogs.sap.com/?p=820837&preview=true&preview_id=820837)

### Github Repository for this part:
https://github.com/entmike/hanadev/tree/Part3

# Overview
In the second part of this series, I will cover creating a basic Vue frontend to consume our backend service that we created in Part 2.

## Prerequisites

- Cloud 9 set up and configured as described in [Part 1](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
- Backend created as described in [Part 2](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)

# Update the .env file
In part 2, we made use of the `SYSTEM` user to perform a quick test of our backend app.  In a real world use case, we of course do not want to do this.  So we will designate some new environment variables to specify a new application user and password.

```
HXE_MASTER_PASSWORD=HXEHana1
HANA_APP_UID=APPUSER
HANA_APP_PWD=SomeSecretPassword
HANA_SERVER=hxehost:39017
HANA_APP_BACKEND=/backend
```

# Update the docker-compose.yaml file

Open the `docker-compose.yaml` file under `/hanadev` and update the contents as follows:

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
      - HANA_UID=${HANA_APP_UID}
      - HANA_PWD=${HANA_APP_PWD}
      - HANA_SERVERNODE=${HANA_SERVER}

  sqlpad:
    image: sqlpad/sqlpad
    volumes:
      - sqlpad:/var/lib/sqlpad
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
  sqlpad:
```

Basically, we've only changed the `hello-world-app` environment variable mapping of `HANA_UID` and `HANA_PWD` to point to our new `HANA_APP_UID` and `HANA_APP_PWD` variables in our `.env` files.

# Create the Application User

1. Let's briefly start up our HANA Express DB and SQLPad by typing the following from the `hanadev` directory in a terminal window.
    
    ```bash
    docker-compose up
    ```

2. Open up SQLPad from `http://[cloud 9 external IP]:8899` and log in with the user you created.  Refer to Part 1 if you need a reminder on how to log in.

3. Create a new SQL statement as follows and click **Run**
    
    ```sql
    CREATE USER APPUSER PASSWORD SomeSecretPassword NO FORCE_FIRST_PASSWORD_CHANGE;
    ```
4. That's it.  We can now stop our Stack by pressing `Control + C` in the terminal window that you typed `docker-compose up`.

5. Let's start back up our stack one last time and make sure our backend app is now running as our new application user.  Run `docker-compose-up -d` and wait about 60 seconds for HANA Express to start up.

6. Next, type `curl -X POST http://localhost:3333/api/overview | grep user`.  You should get a one line back of the JSON output similar to below:

    ```bash
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100  1202  100  1202    0     0  52260      0 --:--:-- --:--:-- --:--:-- 52260
    "user": "APPUSER"
    ```
    Congratulations!  You've successfully modified the backend app to use an application user.

# Creating a Vue Project

As I mentioned in Part 1, it's been a long time since playing in web frameworks.  While this can be a bit of a divisive Holy War topic, for me, I've gotten particularly fond of Vue.  If you are more of an Angular or React person, feel free to replace these steps with your favorite frontend tool and read no further.  If you'd like to create a super simple Vue app, read on.

1. From a terminal window in Cloud 9, type `npm i -g @vue/cli`.  This will install Vue and the Vue CLI.

2. Next, since I'm not a big CLI guy, let's start up the GUI for the CLI by typing `vue ui -p 8080` from the `hanadev/hello-world-app` directory (important.)  Once you see the status in your terminal below, proceed to the next step.
    
    ```bash
    ec2-user:~/environment/hanadev (Part3) $ vue ui -p 8080
      Starting GUI...
      Ready on http://localhost:8080
    ```

3. In the Cloud 9 toolbar, click **Preview** -> **Preview Running Application**.  A browser window inside your Cloud 9 IDE should open.

4. Click the **Create** button and then click **Create a new project here**.

5. For **Project Folder**, name it `frontend`.  Click **Next**.

6. For **preset**, leave **Default preset** select and click **Create Project**.  Vue CLI will begin to generate the boilerplate project files under the `hanadev/hello-world-app/frontend` folder.  After a few moments, you should arrive at a screen saying "Welcome to your new project!".

7. On the left edge of the page, find the puzzle piece **Plugins icon** and click it.  Then, click the **+ Add plugin** button at the top-left.

7. We are going to install 2 plugins.  A routing plugin and a UI plugin.  For the router plugin, there should be a **Add vue-router** button placed prominently at the top of the plugins page.  Click it, and then click **Continue**.  Then don't forget to click **Finish installation**

8. After vue-router finishes installing, search for `vue-cli-plugin-vuetify`.  Click on the matching search result and click on **Install vie-cli-plugin-vuetify**. 

9. After the installation is complete, click on the **Tasks** icon on the left edge of the page.  (Clipboard icon.)

10. This page serves as a launching point to run vue-cli tasks that you can either opt to use this page to run, or if you are more of a CLI person, you can run from a terminal if you so wish.  For now though, let's click on **serve** and then **Run task**.

11. Once the green checkbox appears, we know that our Vue app is running.  Click on the **Output** button to monitor the status of our serve task.  You should see something similar to the following:
    
    ```
        
      App running at:
        Local:   http://localhost:8081/ 
        Network: http://172.16.0.99:8081/
    
    
    Note that the development build is not optimized.
    To create a production build, run npm run build.
    ```

12.  Since we are running in Cloud 9 IDE, the IP address reported back and hostname are not accessible from your browser.  You will want to substitute your Cloud 9 External IDE here.  You also will need to expose port `80xx` (whichever one is mentioned in the output) in our Cloud 9 EC2 instance in order to access this application easier.  Refer to steps in Part 1 if you do not know how to do this.  I'd recommend opening up ports `8080` through `8085` as sometimes we may be running more than one app at once and it will save you a trip to the EC2 Dashboard later on.

13.  After noting the `80xx` port, navigate to `http://[your cloud 9 external ip]:80xx`.

14.  If you get back a `Welcome to Your Vue.js App` congratulations!  We are ready to start coding.

# Modifying your Vue Project

Now that we have created the boilerplate Vue Project, we are ready to make some changes to the application.  While I am not a Vue expert, and for sake of brevity, I won't be explaining everything that's going on.  There are many, many great Vue tutorials online that I'd highly suggest you look for if you are interested in Vue.

1. In your Cloud 9 IDE, locate the `/hanadev/hello-world-app/frontend` folder.  This is where all your frontend code has now been generated.  Modify/Create the following files.

2. **Create Environment Variable files**
    
    1. `/hello-world-app/frontend/.env.production`:
    
        This file will be used for our final productin build.  The `VUE_APP_HANA_APP_BACKEND` variable tells the frontend app where to issue backend requests to.  For production, we'll handle this with Nginx a bit later on.
        ```
        VUE_APP_HANA_APP_BACKEND=/backend
        ```
    2. `/hello-world-app/frontend/.env.development.local`
        
        **NOTE:** Be sure to add your Cloud 9 External IP address in the placeholder below.  For development, we'll want to hit our running Docker stack running in Cloud 9.
        
        ```
        VUE_APP_HANA_APP_BACKEND=http://[your cloud 9 external ip]:3333
        ```

3. **Modify** `/hello-world-app/frontend/src/main.js`

    ```javascript
    import Vue from 'vue'
    import './plugins/vuetify'
    import App from './App.vue'
    
    import router from './router'
    
    if(!process.env.VUE_APP_HANA_APP_BACKEND){
      alert("VUE_APP_HANA_APP_BACKEND environment variable not set.  Please set your environment and restart this frontend server.")
    }else{
      Vue.config.productionTip = false
      new Vue({
        router,
        render: h => h(App)
      }).$mount('#app')
    }
    ```

4. **Modify/Create** `/hello-world-app/frontend/src/router.js`

    ```javascript
    import Vue from 'vue'
    import Router from 'vue-router'
    import Overview from './views/Overview.vue'
    
    Vue.use(Router)
    
    export default new Router({
      routes: [
        {
          path: '/',
          name: 'Overview',
          component: Overview
        }
      ]
    })
    ```

5. **Modify** `/hello-world-app/frontend/src/App.vue`

    ```xml
    <template>
      <v-app dark>
        <AppNav :systemInformation="results.backend_information"/>
        <v-content transition="slide-x-transition">
          <router-view />
        </v-content>
      </v-app>
    </template>
    <script>
      import AppNav from '@/AppNav';
      import axios from 'axios';
      export default {
        name: 'App',
        components: {
            AppNav
        },
        data () {
          return {
            results: {
              backend_information : {
                user : 'dummy'
              }
            }
          };
        },
        methods : {
          getData (){
            axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/overview/',{ }).then(res=>{
              if(res.data){
                this.results = res.data;
                this.systemInformation = res.data.backend_information;
                // console.log(this.results);
              }else{
                alert(JSON.stringify(res));
                this.results = {};
              }
            }, err=> {
              alert(JSON.stringify(err.response.data));
            }).catch(err=>{
              alert(`An error occured communicating with the backend.
              ${err}`);
            })
          },
        },
        mounted(){
            this.getData();
        }
    };
    </script>
    ```

6. **Create** `/hello-world-app/frontend/src/AppNav.vue`

    ```xml
    <template>
        <v-toolbar app color="blue darken-4" dark>
            <v-toolbar-title>{{appTitle}}</v-toolbar-title>
            <template v-for="(item,index) in items">
                <v-btn v-if="typeof item.link === 'undefined'" :key=index flat :to="'/' + item.title">{{item.title}}</v-btn>
                <v-btn v-else :key=index flat :to="'/' + item.link">{{item.title}}</v-btn>
            </template>
            <v-spacer />
            <v-chip color="primary" label outline     text-color="white">{{systemInformation.user}}@{{systemInformation.server}}:{{systemInformation.port}}</v-chip>
        </v-toolbar>
    </template>
    
    <script>
    export default {
        name: 'AppNav',
        props : {
            systemInformation : Object
        },
        data(){
            return{
                appTitle: 'HANA Sandbox',
                drawer: false,
                items: [
                    { title: 'Overview',link: '' }
                ]
            };
        }
    };
    </script>
    
    <style scoped>
    </style>
    ```

7. **Delete** any files (`About.vue`, `Home.vue` etc.) under `/hello-world-app/frontend/src/views`

8. **Create** `/hello-world-app/frontend/src/views/Overview.vue`
    
    ```xml
    <template>
      <div>
        <v-list two-line>
          <template v-for="(item,index) in results.M_SYSTEM_OVERVIEW">
            <v-list-tile :key="index">
              <v-list-tile-content>
                <v-list-tile-title v-html="item.KEY"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.VAL"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </div>
    </template>
    
    <script>
    import axios from 'axios';
    export default {
      name: 'Overview',
      data: () => ({
        results: []
      }),
      components: {},
      methods: {
        getData(){
          axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/overview/',{ }).then(res=>{
            if(res.data){
              this.results = res.data;
            }else{
              this.results = {};
            }
          }, err=> {
            alert(JSON.stringify(err.response.data));
          }).catch(err=>{
            alert(`An error occured communicating with the backend.
            ${err}`);
          })
        }
      },
      mounted(){
        this.getData();
      }
    }
    </script>
    ```

9. The the `Overview.vue` file, we are making use of the `axios` npm module, so we will want to install this.  To do so, open a terminal window in Cloud 9 and cd to your `frontend` folder.  Type `npm i axios` to install it.

# Running our Frontend App in Developer Mode

If you are still running the `vue-cli` UI, you can now terminate it by pressing `Control + C`.  We will now demonstrate how to run the same serve task via command line from the terminal.

1. Make one more trip over to your EC2 Console and expose port `3333`.  This is our backend port that we'll need our browser to hit in order to get back data from our HANA Container running in our Stack while running in Developer mode.  For "production" use cases, we will not need this port.

2. In a terminal window:
    
    If your Docker Compose stack is not already running, start it now:
    ```bash
    cd /hanadev
    docker-compose up -d
    ```
    
    Next, let's start up our frontend app in developer mode.
    
    ```bash
    cd /hanadev/hello-world-app/frontend`
    npm run serve
    ```

3. After a few moments, you should receive the following feedback in your terminal:
    
    ```bash
     DONE  Compiled successfully in 20991ms                                                                     18:59:50
    
     
      App running at:
      - Local:   http://localhost:8080/ 
      - Network: http://172.16.0.99:8080/
    
      Note that the development build is not optimized.
      To create a production build, run npm run build.
    ```

3. Like earlier, disregard the internal IP, and replace it with your Cloud 9 External IP address and navigate to `http://[your cloud 9 external ip]:80xx` where `80xx` is the port mentioned above.

4. If all has gone well, you should receive a page titled "HANA Sandbox" with your App User shown at the top right, and your HANA Express system information shown below.  If so, congratulations!  You've created a frontend app that is consuming your Docker Compose stack's backend service!
 
Running in this manner allows us to make code changes to our frontend application live in Cloud 9 without deploying over and over again, yet at the same time attaching to our Docker Compose stack's backend app and HANA Express DB.  Pretty cool!

After celebrating, terminate the development mode task by pressing `Control + C`.

# Wrapping it up in our Container

For Part 3, we'll consider this a "Milestone" and use this as an opportunity to bundle our frontend application changes into our `docker-compose.yaml` file before we call it a day.  We'll need to update a few files to incorporate the frontend app.

1.  Open your `Dockerfile` located under `/hanadev`  Update it with the following:
    
    ```dockerfile
    # Docker Image containing SAP HANA npm package
    FROM node:8-slim
    
    LABEL Maintainer="Your Name <your.name@example.com>"
    
    # Install nginx to handle backend and frontend apps
    RUN apt-get update && apt-get install -y nginx
    
    # Add SAP HANA Client NPM package from SAP's npm repository
    RUN npm config set @sap:registry https://npm.sap.com && npm i -g @sap/hana-client
    
    # Set the global NPM path Environment variable
    ENV NODE_PATH /usr/local/lib/node_modules
    
    # Configure nginx and startup
    COPY ./hello-world-app/server.conf /etc/nginx/conf.d/default.conf
    # Copy backend Node JS modu
    COPY /hello-world-app/backend /app/backend
    # Copy production build of Vue frontend app
    COPY /hello-world-app/frontend/dist /app/frontend
    # Copy startup.sh script
    COPY ./hello-world-app/startup.sh /app/startup.sh
    
    WORKDIR /app
    CMD ./startup.sh
    ```
    
    We are adding 3 new main items here:
    
    1. Our frontend app's production `dist` folder will be copied over to our Docker images's `/app/frontend` folder.  The production `dist` folder is an optimized and minified version of our frontend Vue app.
    
    2. Install Nginx and copy some configuration files to do some reverse proxy magic so that we can just have one single port exposed from our container and to abstract the underlying architecture away.
    
    3. Copy over a `startup.sh` script since we'll be launching more than one process for the `CMD` line.

2. Create `startup.sh` in `/hanadev/hello-world-app`
   
    ```bash
    #!/bin/sh
    echo "Starting Servers..."
    mkdir -p /run/nginx
    rm /etc/nginx/sites-enabled/default
    echo "Starting nginx..."
    nginx
    cd /app/backend
    echo "Starting backend..."
    npm run prod
    ```
3. Change permissions to executable for `startup.sh` from a terminal window

   ```bash
   cd /hanadev/hello-world-app
   chmod +x startup.sh
   ```

4. Create `server.conf` in `/hanadev/hello-world-app`

   ```conf
    server {
        listen      80 default_server;
        # document root #
        root        /app/frontend/;
        
        # Route requsts to /backend/ to Backend npm module
        location /backend/ {
            proxy_pass http://localhost:9999/;
        }
    }
    ```

5. Build our Vue frontend app to generate the `dist` folder.

    ```bash
    
    cd /hanadev/hello-world-app/frontend
    npm run build
    ```
    
    You should get some feedback similar to this:
    
    ```bash
     > frontend@0.1.0 build /home/ec2-user/environment/hanadev/hello-world-app/frontend
     > vue-cli-service build
     
     
     ⠏  Building for production...
     
      WARNING  Compiled with 2 warnings                                                                               19:16:17
     
      warning  
     
     entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244      KiB). This can impact web performance.
     Entrypoints:
       app (303 KiB)
           css/chunk-vendors.bc527eeb.css
           js/chunk-vendors.2793d0c4.js
           js/app.02b450ce.js
     
     
      warning  
     
     webpack performance recommendations: 
     You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your      application.
     For more info visit https://webpack.js.org/guides/code-splitting/
     
       File                                   Size              Gzipped
     
       dist/js/chunk-vendors.2793d0c4.js      180.43 KiB        60.10 KiB
       dist/js/app.02b450ce.js                4.87 KiB          2.03 KiB
       dist/css/chunk-vendors.bc527eeb.css    118.13 KiB        15.45 KiB
     
       Images and other types of assets omitted.
     
      DONE  Build complete. The dist directory is ready to be deployed.
      INFO  Check out deployment instructions at https://cli.vuejs.org/guide/deployment.html
     ```
6. Update our `docker-compose.yaml` file under `/hanadev`:

    ```yaml
    version: '2'
        
    services:
        
      hello-world-app:
        build: 
          context: .
          dockerfile: ./hello-world-app/Dockerfile
        ports:
          # - "3333:9999" No longer needed we are using Nginx
          # Reroute Nginx listening on Port 80 over to 8080 which we've already exposed in EC2
          - "8080:80"
        environment:
          - HANA_UID=${HANA_APP_UID}
          - HANA_PWD=${HANA_APP_PWD}
          - HANA_SERVERNODE=${HANA_SERVER}
    
      sqlpad:
        image: sqlpad/sqlpad
        volumes:
          - sqlpad:/var/lib/sqlpad
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
      sqlpad:
    ```
    
    - Basically all that we've done is removed the backend port (`3333`) from being accessible, since our Nginx app inside of our Docker container will be reverse-proxying calls to the npm task running there.  For development use cases, you may wish to leave this in place for when developing live and not hosting inside a container, or better yet, simply have a separate docker compose stack for when you are developing, and maybe this one that represents "production".
    
    - Secondly, we're exposing Nginx that is listening on Port `80` over to Port `8080` since we've already exposed `8080` in our EC2 Dashboard, and that will save us a trip and another exposed port.
    
6. Rebuild our docker-compose stack:

    ```bash
    cd /hanadev
    docker-compose build
    ```
    
    **Note** The initial time you run the build it will take longer, as we've added in a few new Docker image layers to account for the new Nginx addition, etc.  After 2 minutes or so, you should get a confirmation that the build has finished successfully:
    
    ```bash
    
    ...
    
    Step 7/11 : COPY /hello-world-app/backend /app/backend
     ---> c5c3508dc2a2
    Step 8/11 : COPY /hello-world-app/frontend/dist /app/frontend
     ---> 6ee34d81d8d5
    Step 9/11 : COPY ./hello-world-app/startup.sh /app/startup.sh
     ---> 60f38e70da77
    Step 10/11 : WORKDIR /app
     ---> Running in e54ee8b3c9c6
    Removing intermediate container e54ee8b3c9c6
     ---> df3d269e1dff
    Step 11/11 : CMD ./startup.sh
     ---> Running in 594e5016ca51
    Removing intermediate container 594e5016ca51
     ---> 4abedcaed348
    Successfully built 4abedcaed348
    Successfully tagged hanadev_hello-world-app:latest
    ```

# Moment of Truth

We are now ready to test our new Docker Compose stack.

1. From `/hanadev`, type:

    ```bash
    docker-compose up
    ```
    
2. After about 60 seconds, open a browser tab and visit `http://[your cloud 9 ide external ip]:8080`  If you see the HANA Sandbox page with your HANA Express system overview, congratulations!  You've successfully containerized your frontend and backend app!

# What's Next?

As much as I enjoy creating punishing and grueling tutorial blogs, I'm open for any suggestions or ways to improve subsequent posts.  Otherwise, for the next Part, we'll add to this frontend application some additional Vue routes for the frontend app, as well as Express backend routes to feed it.