<template>
    <v-toolbar app color="blue darken-4" dark>
        <v-toolbar-title>{{appTitle}}</v-toolbar-title>
        <template v-for="(item,index) in items">
            <v-btn v-if="typeof item.link === 'undefined'" :key=index flat :to="'/' + item.title">{{item.title}}</v-btn>
            <v-btn v-else :key=index flat :to="'/' + item.link">{{item.title}}</v-btn>
        </template>
        <v-spacer />
        <v-chip color="primary" label outline text-color="white">{{systemInformation.user}}@{{systemInformation.server}}:{{systemInformation.port}}</v-chip>
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