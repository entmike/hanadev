<template>
  <div>
    <v-app v-if="config.status==undefined">
      <LoadingDialog v-model="loading" message="Loading, please wait..."/>
      <ErrorDialog v-model="error" :message="errorMessage"/>
    </v-app>
    <RunningApp v-if="config.status == 'configured'"/>
    <SetupWizard v-if="config.status == 'initial'"/>
    <MissingEnv :missing=this.config.missing v-if="config.status == 'missingenv'"/>
  </div>
</template>
<script>
  import SetupWizard from '@/SetupWizard';
  import RunningApp from '@/RunningApp';
  import LoadingDialog from '@/LoadingDialog';
  import ErrorDialog from '@/ErrorDialog';
  import MissingEnv from '@/MissingEnv';
  import axios from 'axios';
  export default {
    name: 'App',
    components: {
        RunningApp, SetupWizard, LoadingDialog, ErrorDialog, MissingEnv
    },
    data () {
      return {
        loading : true,
        error : false,
        errorMessage : '',
        config : {}
      };
    },
    methods : {
      getConfig (){
        axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/getconfig/',{ }).then(res=>{
          this.loading = false;
          this.config = res.data;
        },err=>{
          this.loading = false;
          this.error = true;
          this.errorMessage = (err.response)?err.response.data:err;
        });
      }
    },
    mounted(){
        this.getConfig();
    }
};
</script>