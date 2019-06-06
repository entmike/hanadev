import Vue from 'vue';
import VueSocketio from 'vue-socket.io';

import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import socketio from 'socket.io-client';

Vue.use(new VueSocketio({
    debug: true,
    connection: `${process.env.VUE_APP_HANA_APP_BACKEND}`,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    // options: { path: "/my-app/" } //Optional options
}));

if(!process.env.VUE_APP_HANA_APP_BACKEND){
  alert("VUE_APP_HANA_APP_BACKEND environment variable not set.  Please set your environment and restart this frontend server.");
}else{
  Vue.config.productionTip = false;
  new Vue({
    sockets: {
        connect: function () {
            console.log('socket connected')
        },
        setupapp: function (data) {
            console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
        }
    },
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
}