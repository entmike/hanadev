<template>
    <v-toolbar app color="green darken-3" dark>
        <v-toolbar-title>{{appTitle}}</v-toolbar-title>
        <template v-for="(item,index) in items">
            <v-btn v-if="typeof item.link === 'undefined'" :key=index flat :to="'/' + item.title">{{item.title}}</v-btn>
            <v-btn v-else :key=index flat :to="'/' + item.link">{{item.title}}</v-btn>
        </template>
        <upload-btn ref="uploadbutton" title="Upload Data" @file-update="update">
          <template slot="icon">
            <v-icon>add</v-icon>
          </template>
        </upload-btn>
        <v-spacer />
        <v-chip label outline text-color="white">{{systemInformation.user}}@{{systemInformation.server}}</v-chip>
    </v-toolbar>
</template>

<script>
import UploadButton from 'vuetify-upload-button';
import axios from 'axios';

export default {
    name: 'AppNav',
    components : {
        'upload-btn': UploadButton
    },
    props : {
        systemInformation : Object
    },
    methods: {
      update (file) {
        // this.$refs.uploadbutton.clear();
        let formData = new FormData();
        formData.append('file', file);
        axios.post(process.env.VUE_APP_HANA_APP_BACKEND + '/api/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res=>{
            console.log(res);
        });
      }
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