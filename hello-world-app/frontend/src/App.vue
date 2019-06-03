<template>
  <v-app dark>
    <AppNav :appState="appState" :systemInformation="results.backend_information"/>
    <v-content transition="slide-x-transition">
      <router-view :systemProperties="results.M_SYSTEM_OVERVIEW"/> 
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
            user : 'UNKNOWN'
          }
        },
        appState : {
          color : '#C0C0C0',
          status : 'initial',
          errMessage :''
        },
        errorVisible : false
      };
    },
    methods : {
      getData (){
        axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/overview/',{ }).then(res=>{
          this.results = res.data;
          this.systemInformation = res.data.backend_information;
          this.appState = {
            color : '#009966',
            status : 'connected'
          };
        }, err=>{
          this.appState = {
            color : '#FF0000',
            status : 'fail',
            errorMessage : err.response.data
          };
          this.$router.push('Error');
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