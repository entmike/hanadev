# Series

1. [Develop Simple on HANA Express in AWS Cloud 9](https://blogs.sap.com/2019/05/16/develop-simple-on-hana-express-in-aws-cloud-9/)
2. [Develop Simple on HANA Express in AWS Cloud 9 Part 2 – The Backend App](https://blogs.sap.com/2019/05/17/develop-simple-on-hana-express-in-aws-cloud-9-part-2-the-backend-app/)

# Introduction
This blog post started much simpler as a personal wiki set of notes on how to quickly set up a Cloud 9 IDE in AWS to use HANA.  However, as I continued to document, the more I felt like this might be an interesting story/journey of mine to share.  Probably the past 2 or 3 months, I've been on a personal journey of getting back into application/web development after many years of spending time in Analytics/BI/Design Studio SDKing etc.

I've been coding in one language or another for decades, but spending so much time in the BI area has left me playing catch up, as containerization, npm, web frameworks, etc have change dramatically over the past 6-7 years.  Even new methodologies like CI/CD and DevOps all feel foreign and new to me.

And while I've kept up *just enough* to know what Docker is, and I can spell Kubernetes, I'm not quite ready to go all in with a container orchestration platform.  I guess because I'm more on the "Dev" side of "DevOps" spectrum, Kubernetes doesn't (and shouldn't) excite me that much.  Maybe another year/life...

So with my meager financial/platform resources and knowhow as a developer, I've set off to try to do some fun lean application development with the following parameters in mind:

- Use **HANA Express**.  Since it's an area of affection for me and (increasingly familiar because of my Analytics background/day-job.)  Sure, I could use MySQL/MariaDB/SQLite but where's the fun in that?  That's been done by zillions of others.
- Use **AWS Cloud 9** IDE.  Now this won't make anyone in SAP very happy, but I've chosen **not** to use SAP Cloud Platform/WebIDE/Cloud Foundry.  I've taken dozens of recent tutorials on http://developers.sap.com and they are **terrific**, however I simply think that it's quite over-architected for developing simple applications.  Perhaps I'll grow into it in the future.  I've chosen Cloud9 because:

    - It's cheap to run and will turn itself off.
    - It's a hackable EC2 instance that I can ssh into easily
    - The UI is intuitive and straightforward
- **Containerize**.  Last year I sat down and took the time to understand the beauty, power and elegance of Docker containers.  It truly is a game changer for deployments and baselining an application to work on, you know, not just "my PC".  But I dont want to jump off the deep end with Kubernetes.  It's just overkill for my brain.  I've chosen to use **Docker Compose** since it doesn't require me to understand k8s concepts such as Nodes/Workers, Pods, Clusters, etc.  To me, a Docker Compose file is a nice toe in the water for someone like me coming from simple Node/NPM development -> simple Docker Containers -> and now Docker Compose.  I'm sure I'll eventually embrace a larger container orchestration framework, I'm working my way from bottom up, rather than top down, which I know where a lot of other tend to start.

So how feasible/quick is it?  It turns out (for me) to not be too bad at all!  So if you are someone how likes HANA but maybe wants to try a non-SAP Cloud IDE, read on and follow this initial Part of a multi-part series on coding in Cloud 9 with HANA Express.

# Goal
The goal of this blog is to walk you through the simplest configuration of a Docker Compose stack running a SQLPad Container that can interact with the HANA Express container.  Futher posts will build off of this initial Compose stack, so follow along if you have the time/patience.

## Feedback/Questions
Please don't hesitate to drop me a comment/question/flame if something simply doesn't work or make sense, or even if you disagree with this approach or my overall values in life.  I appreciate any feedback!  :)

# Initial Configuration
This section explains initial configuration needed for your Cloud 9 environment.  We will install Docker Compose, log into DockerHub with your Docker Account, and resize your Cloud 9 environment's disk size from the default 10GB to 20GB to make a little more room for HANA Express.

## Prerequisties

- [AWS Cloud 9 Instance](https://aws.amazon.com/cloud9/) (`m4.large` (8 GiB RAM + 2 vCPU) recommended)
    Setup is easy in AWS and takes about 2 or 3 minutes to be up and running.
    
- [DockerHub Account](https://hub.docker.com/) (Free)
    Since SAP makes you log into Docker Hub to pull their HANA Express image, you'll want to create a free Docker Hub account to do so.

## Log into Docker and install Docker Compose

1. Log into Cloud 9
2. Open a Terminal window and run:
    
    ```bash
    docker login -u yourusername
    ```
    Provide your password and proceed with the following commands:
    ```bash
    sudo curl -L https://github.com/docker/compose/releases/download/1.24.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    ```
    
## Resize your Cloud 9 Environment
The initial Cloud 9 environment is just a tad too small (10GB) so we'll want to increase the disk size to **20GB**.  Don't worry, it's quick and painless.

1. Create a file called `resize.sh` in the root directory of your workspace and paste the following script:
    *(Script courtesy of Amazon documentation: https://docs.aws.amazon.com/cloud9/latest/user-guide/move-environment.html)*
    
    ```bash
    #!/bin/bash

    # Specify the desired volume size in GiB as a command-line argument. If not specified, default to 20 GiB.
    SIZE=${1:=20}
    
    # Install the jq command-line JSON processor.
    sudo yum -y install jq
    
    # Get the ID of the envrionment host Amazon EC2 instance.
    INSTANCEID=$(curl http://169.254.169.254/latest/meta-data//instance-id)
    
    # Get the ID of the Amazon EBS volume associated with the instance.
    VOLUMEID=$(aws ec2 describe-instances --instance-id $INSTANCEID | jq -r .Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId)
    
    # Resize the EBS volume.
    aws ec2 modify-volume --volume-id $VOLUMEID --size $SIZE
    
    # Wait for the resize to finish.
        while [ "$(aws ec2 describe-volumes-modifications --volume-id $VOLUMEID --filters Name=modification-state,Values="optimizing","completed" | jq '.VolumesModifications | length')" != "1" ]; do
      sleep 1
    done
    
    # Rewrite the partition table so that the partition takes up all the space that it can.
    sudo growpart /dev/xvda 1
    
    # Expand the size of the file system.
    sudo resize2fs /dev/xvda1
    ```
2. From a Terminal window, type:
     
    ```bash
    chmod +x resize.sh 
    ./resize.sh 20
    ```
    After a few moments and some console spam, you should receive a confirmation that your disk has been resized:
    
    ```
    {
        "VolumeModification": {
            "TargetSize": 20, 
            "TargetVolumeType": "gp2", 
            "ModificationState": "modifying", 
            "VolumeId": "vol-0daed2d158c3fafc1", 
            "TargetIops": 100, 
            "StartTime": "2019-05-16T18:01:42.000Z", 
            "Progress": 0, 
            "OriginalVolumeType": "gp2", 
            "OriginalIops": 100, 
            "OriginalSize": 10
        }
    }
    CHANGED: disk=/dev/xvda partition=1: start=4096 old: size=20967390,end=20971486 new: size=41938910,end=41943006
    resize2fs 1.43.5 (04-Aug-2017)
    Filesystem at /dev/xvda1 is mounted on /; on-line resizing required
    old_desc_blocks = 1, new_desc_blocks = 2
    The filesystem on /dev/xvda1 is now 5242363 (4k) blocks long.
    ```

## Setting up a Stack

This section shows how to set up a simple HANA development stack complete with a running instance of HANA Express.
1. In Cloud 9, create a new folder in called `hanadev` in the root of your workspace.
2. Create a new file called `docker-compose.yaml` and paste in the following.
    
    ```yaml
    version: '2'
    
    services:
    
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
    
    Basically, this Docker Compose file defines 2 containers:
    
    1. HANA Express
    2. SQLPad, a simple, lightweight container that has the ability to connect to SAP HANA without having to fiddle with any driver installations.  This will serve as our first test to ensure that we can connect to our HANA Express DB.
    
    ***Note:***
    
    Since both SQLPad and HANA Express are in the same default Docker-Compose Network, we do not need to expose the standard HANA Express Docker Ports (39017, etc) since at this time, we will be using SQL Pad to interact directly with HANA Express inside the network.  What we will only be exposing is the SQLPad Port (`8899`)
    
5. In your Terminal, cd to your `hanadev` folder.
    
    ```bash
    cd hanadev
    ```
6. Set the environment variable `HXE_MASTER_PASSWORD` to your desired password.  Example:
    
    ```bash
    export HXE_MASTER_PASSWORD=HXEHana1
    ```
7. Run your Docker Compose stack (first time)
    
    ```bash
    docker-compose up
    ```
8. At this point, your Terminal will start pulling Docker images and spamming you with log progress.  On a `m4.large` instance, this process should take about 6-7 minutes.  You will know when it is complete when you see a tail of the log with something similar below:
    ```bash
    hxehost_1  | Duration of start operations ...
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/010_license_agreement: 0s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/110_clean_hdbdaemon_status: 0s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/120_clean_pid_files: 0s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/130_update_clean_wdisp: 0s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/310_init_ssfs: 41s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/320_config_cert: 1s
    hxehost_1  |     (Pre start) Hook /hana/hooks/pre_start/330_custom_afls: 0s
    hxehost_1  |     (Pre start) Prep persistence: 46s
    hxehost_1  |     Pre start: 89s
    hxehost_1  |     HANA startup: 43s
    hxehost_1  |     (Post start) Tenant creation: 268s
    hxehost_1  |     (Post start) License import: 0s
    hxehost_1  |     (Post start) Hook /hana/hooks/post_start/201_hxe_optimize: 7s
    hxehost_1  |     (Post start) Hook /hana/hooks/post_start/203_set_hxe_info: 0s
    hxehost_1  |     Post start: 280s
    hxehost_1  |     Overall: 413s
    hxehost_1  | Ready at: Thu May 16 17:03:31 UTC 2019
    hxehost_1  | Startup finished!
    ```
    Congratulations!  You now have a Stack running HANA Express and SQLPad!

9.  At this point, we can stop the stack, by pressing `Control + C`:
    
    ```bash
    Gracefully stopping... (press Ctrl+C again to force)
    Stopping hanadev_sqlpad_1  ... done
    Stopping hanadev_hxehost_1 ... done
    ```
10. Now that our stack has successfully started and stopped, let's take a quick look at how much space this has taken:
    
    ```bash
    docker system df
    ```
    This should return a readout similar to below:
    ```
    TYPE                TOTAL               ACTIVE              SIZE                RECLAIMABLE
    Images              7                   2                   4.498GB             1.319GB (29%)
    Containers          2                   0                   67.7kB              67.7kB (100%)
    Local Volumes       1                   1                   3.247GB             0B (0%)
    Build Cache         0                   0                   0B                  0B
    ```
    As we can see, the base footprint needed to run HANA Express in this container is around 3.25 GB.  Pretty small, not too bad!
    
11. Also, if you want to see how much room is left on your Cloud 9 instance, you can type `df -h /`:
    
    ```bash
    Filesystem      Size  Used Avail Use% Mounted on
    /dev/xvda1       20G   12G  8.0G  60% /
    ```
    As you can see, we have plenty of play area left (8GB) even with HANA Express container running!

# Stopping and Starting

This section explains how to start and stop your stack.

## Running the Stack

After successfully setting up the stack, to run it again in the background, you want to run it "detached".  This allows you to close your terminal session out and your stack will keep running (make sure you are in your `hanadev` directory when doing so):

```bash
docker-compose up -d
```

## Stopping the Stack

In order to stop your stack, you will need to issue the following command to stop it (make sure you are in your `hanadev` directory when doing so):
    
```bash
docker-compose down
```

# Exposing SQLPad to the outside world
Now that we know that we have a working stack, we need to expose port `8899` in order to use the SQLPad application.  First, we must see what AWS gave our Cloud 9 IDE as a public IP.  There are multiple ways to find this out.

- Check your EC2 Dashboard on AWS and look for the External IP
- Lazy way without leaving Cloud 9

    From a Terminal in Cloud 9, simply type `curl http://169.254.169.254/latest/meta-data//public-ipv4` and note the IP address.

The lazy way is nice, since this saves you a trip to the EC2 console as you develop off and on, and your IP changes.  However for this first time, we'll need to make the trip to the EC2 Console and select out EC2 Instance assigned to the Cloud 9 IDE.

1. From your EC2 Console, click on the autogenerated Security Group named something similar to `aws-cloud9-dev-abc732487cbada-InstanceSecurityGroup-322138957189`.
2. You will be taken to the Security Group section in the EC2 Dashboard.  Right-click on the selected rule and click **Edit inbound rules**.
3. Click on **Add Rule** and populate the following fields:
    
    |Property|Value|
    |--------|-----|
    |Port Range|`8899`|
    |Source|`0.0.0.0/0`|
    |Description|`SQLPad Web Interface`|
    
4. We are now ready to test SQLPad!  With your IP address in hand, in a browser window navigate to `http://1.2.3.4:8899` where `1.2.3.4` is the IP address.
    **Note** If you are not greeted with a SQLPad page, make sure your Docker Compose stack is running!  (`docker-compose up -d` from `hanadev` directory)
5. If you see the SQLPad login page, congratulations!  Click on the **Sign Up** link and register.  (The first to register becomes administrator, so hurry!  :))

# Using SQLPad
## Connecting to your HANA Express DB
Now that you have registered to your SQLPad application, you will want to create an initial connection to your HANA Express database.

1. At the top right of your SQLPad page, click you your user name -> and click **Connections**
2. Click **New Connection** and populate the following fields:

    | Property | Value |
    | --- | --- |
    | Connection Name | `HXE` |
    | Database Driver | `SAP HANA` |
    | Host/Server/IP Address | `hxehost` |
    | Port (e.g. 39015) | `39017` |
    | Database Username | `SYSTEM` |
    | Database Password | `YourPassword` |
    | Tenant | `HXE` |
    
3. Click **Test** and assuming you get a green "Test Successful" message, click **Save**

## Selecting some data

1. In SQLPad, click **New Query** on the top left.
2. Ensure that the `HXE` connection is selected in the dropdown, and paste in the following SQL Command and then click **Run**:
    
    ```sql
    SELECT TOP 10 TABLE_NAME, RECORD_COUNT, TABLE_SIZE FROM M_TABLES ORDER BY TABLE_SIZE DESC;
    ```

3. Assuming that the stars have aligned and this guide made sense and you've followed all the steps, you should get a query result back at the bottom in a table format.
4. CONGRATULATIONS!  Pat yourself on the back, and stay tuned for the next part of this series which will build upon this stack to include a simple NodeJS container running a module that will read some data from HANA Express.
    

# Cleaning up/Starting Over
In the event that you've completely botched your Stack and need to start over, fret not.  You can remove the mess at any time easily!
## To remove your persistent volumes from the stack
From the `hanadev` directory, type:
```bash
docker-compose down -v
```