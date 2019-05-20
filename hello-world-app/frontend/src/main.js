import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

import router from './router'

if(!process.env.VUE_APP_HANA_APP_BACKEND){
  alert("VUE_APP_HANA_APP_BACKEND environment variable not set.  Please set your environment and restart this frontend server.")
}else{
  Vue.config.productionTip = false
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}