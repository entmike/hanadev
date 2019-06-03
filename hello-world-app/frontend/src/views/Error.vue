<template>
  <div>
    <v-dialog v-model="isDiagnosing" persistent width="300px"/>
    <v-dialog v-model="detailsVisible" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{details.status}}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>{{details.message}}</v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="fixVisible" scrollable>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Fix {{details.text}}</v-toolbar-title>
        </v-toolbar>
        <v-card-title><span>{{details.remedy.message}}</span></v-card-title>
        <v-card-text>
          <component ref="FixForm" :is="currentRemedy" v-model="details.remedy.defaults"/>
          <!--<component :ref="item.option" v-bind:is="item.component" v-model="item.data"></component>-->
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click="item.dialog=false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="runRemedy(details)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-list two-line>
      <template v-for="(check,index) in checks">
        <v-list-tile :key="index">
          <v-list-tile-content>
            <v-list-tile-title v-html="check.text"></v-list-tile-title>
            <v-list-tile-sub-title v-html="check.message"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn color="info" ripple @click="openRemedy(index)">Fix</v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-btn icon ripple @click="runRemedy(check)"><v-icon color="blue lighten-1">info</v-icon></v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import axios from 'axios';
import SetupUser from './SetupUser';
export default {
  name: 'Error',
  data () {
    return {
      checks : [],
      details : {
        remedy : {}
      },
      currentRemedy: '',
      isDiagnosing : false,
      detailsVisible : false,
      fixVisible : false
    }
  },
  components: { 
    SetupUser
  },
  methods : {
    openRemedy (index) {
      this.details = this.checks[index];
      this.currentRemedy = this.checks[index].remedy.component;
      this.fixVisible = true;
      if(this.$refs['FixForm']) this.$refs['FixForm'].$refs.form.resetValidation();
    },
    runRemedy(check){
       if(!this.$refs['FixForm'].$refs.form.validate()){
         return;
       }
      // this.loading=true;
      // this.loadingMessage=item.loadingMessage;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}${check.remedy.endpoint}`,this.$refs['FixForm'].value).then(res=>{
        this.fixVisible = false;
        //this.loading=false;
        //this.complete=true;
        /*this.apiResults={
          status : "Success",
          message : res.data.message
        }*/
      }, err=> {
        alert(err);
        return;
        this.loading=false;
        this.complete=true;
        this.apiResults={
          status : "Error",
          message : (err.response)?(err.response.data)?err.response.data:err.response:err
        }
      });
    },
    showDetails (index) {
      this.details = this.checks[index];
      this.detailsVisible = true;
    },
    diagnose () {
      axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/diagnose/',{ }).then(res=>{
        this.checks = res.data;
      }, err=>{
        alert(err);
      }).catch(err=>{
        alert(`An error occured communicating with the backend.
        ${err}`);
      });
    }
  },
  mounted () {
   this.diagnose();
  }
}
</script>