<template>
    <v-app>
        <LoadingDialog v-model="loading" :message="loadingMessage"/>
        <ErrorDialog v-model="error" :message="errorMessage"/>
        <!-- Login Dialog -->
        <v-dialog v-model="authDialogVisible" persistent>
          <v-card>
            <v-card-title>Authenticate</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <span>Enter your backend password to begin setup.</span>
                <v-form @submit="backendLogin()">
                  <v-text-field
                      v-model="backendPassword"
                      type="password"
                      :rules="requiredRules"
                      label="Backend App Password"
                      required/>
                </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" flat @click="backendLogin()">Authenticate</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-form v-if="authenticated==true" ref="form">
        <v-stepper v-model="e1">
            <v-stepper-header>
              <v-stepper-step :complete="e1 > 1" step="1">Name of step 1</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step :complete="e1 > 2" step="2">Name of step 2</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3">Name of step 3</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <span>Fill in the following user credentials in order to set up your application.</span>
                <v-layout row>
                    <v-text-field
                      v-model="authUser"
                      :rules="requiredRules"
                      label="SYSTEM DB Security Grantor User"
                      required
                    />
                    <v-text-field
                      v-model="authPassword"
                      type="password"
                      :rules="requiredRules"
                      label="SYSTEM DB Security Grantor Password"
                      required
                    />
                </v-layout>
                <v-layout row>
                    <v-text-field
                      v-model="authUser"
                      :rules="requiredRules"
                      label="TENANT DB Security Grantor User"
                      required
                    />
                    <v-text-field
                      v-model="authPassword"
                      type="password"
                      :rules="requiredRules"
                      label="TENANT DB Security Grantor Password"
                      required
                    />
                </v-layout>
                <span>The following new users will be created:</span>
                <v-layout row>
                    <v-text-field
                      v-model="authUser"
                      :rules="requiredRules"
                      label="HDI Admin Name"
                      required
                    />
                    <v-text-field
                      v-model="authPassword"
                      type="password"
                      :rules="requiredRules"
                      label="HDI Admin Password"
                      required
                    />
                    <v-text-field
                      v-model="authPassword"
                      type="password"
                      :rules="requiredRules"
                      label="HDI Admin Password"
                      required
                    />
                </v-layout>

                <v-btn color="primary" @click="e1 = 2">Next</v-btn>
              </v-stepper-content>
        
              <v-stepper-content step="2">
                <v-card
                  class="mb-5"
                  color="grey lighten-1"
                  height="200px"
                ></v-card>
        
                <v-btn color="primary" @click="e1 = 3">Next</v-btn>
                <v-btn color="primary" @click="e1 = 1">Back</v-btn>
              </v-stepper-content>
        
              <v-stepper-content step="3">
                <v-card
                  class="mb-5"
                  color="grey lighten-1"
                  height="200px"
                ></v-card>
        
                <v-btn
                  color="primary"
                  @click="e1 = 1"
                >
                  Continue
                </v-btn>
        
                <v-btn text>Cancel</v-btn>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-form>
    </v-app>
</template>

<script>
import axios from 'axios';
import LoadingDialog from '@/LoadingDialog';
import ErrorDialog from '@/ErrorDialog';
export default {
    name: 'SetupWizard',
    components : { LoadingDialog, ErrorDialog },
    props : { },
    methods : {
      backendLogin () {
          this.loadingMessage = "Authenticating...";
          this.loading = true;
          axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/getallconfig/',{backendPassword:this.backendPassword}).then(res=>{
            this.loading = false;
            this.config = res.data;
            this.authenticated = true;
            this.authDialogVisible = false;
        },err=>{
            this.loading = false;
            this.error = true;
            this.errorMessage = err;
        });
      }  
    },
    data(){
        return{ 
            config : {},
            loading : false,
            loadingMessage : "",
            error : false,
            errorMessage : "",
            authDialogVisible : true,
            backendPassword : '',
            authenticated : false,
            e1: 0,
            requiredRules: [
                v => !!v || 'Field is required'
            ]
        };
    }
};
</script>

<style scoped>
</style>