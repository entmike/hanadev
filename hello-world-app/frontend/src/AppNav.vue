<template>
    <v-toolbar app :color="appState.color" dark>
        <v-toolbar-title>{{appTitle}}</v-toolbar-title>
        <template v-for="(item,index) in items">
            <v-btn v-if="typeof item.link === 'undefined'" :key=index flat :to="'/' + item.title">{{item.title}}</v-btn>
            <v-btn v-else :key=index flat :to="'/' + item.link">{{item.title}}</v-btn>
        </template>
        <v-spacer />
        <v-chip color="primary" label outline text-color="white">{{systemInformation.user}}@{{systemInformation.server}}:{{systemInformation.port}}</v-chip>
        <v-badge color="red">
            <template v-slot:badge>
              <span>!</span>
            </template>
            <v-btn v-if="appState.status == 'fail'" flat icon color="red lighten-2">
                <v-icon overlap color="white">mail</v-icon>
            </v-btn>
      </v-badge>
    </v-toolbar>
</template>

<script>
export default {
    name: 'AppNav',
    props : {
        systemInformation : Object,
        appState : Object
    },
    data(){
        return{
            appTitle: 'HANA Sandbox',
            drawer: false,
            items: [
                { title: 'Overview',link: '' },
                { title: 'Administration',link: 'Admin' }
            ]
        };
    }
};
</script>

<style scoped>
</style>