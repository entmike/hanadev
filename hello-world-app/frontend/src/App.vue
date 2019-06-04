<template>
  <div>
    <v-app v-if="config.configured==undefined">
      <LoadingDialog v-model="loading" message="Loading, please wait..."/>
      <ErrorDialog v-model="error" :message="errorMessage"/>
    </v-app>
    <RunningApp v-if="config.configured == true"/>
    <SetupWizard v-if="config.configured == false"/>
  </div>
</template>
<script>
  import SetupWizard from '@/SetupWizard';
  import RunningApp from '@/RunningApp';
  import LoadingDialog from '@/LoadingDialog';
  import ErrorDialog from '@/ErrorDialog';
  import axios from 'axios';
  export default {
    name: 'App',
    components: {
        RunningApp, SetupWizard, LoadingDialog, ErrorDialog
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
          if(this.config.configured) this.getData();
        },err=>{
          this.loading = false;
          this.error = true;
          this.errorMessage = (err.response)?JSON.stringify(err.response.data):err;
        });
      }
    },
    mounted(){
        this.getConfig();
    }
};
</script>