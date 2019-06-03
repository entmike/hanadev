import Vue from 'vue'
import Router from 'vue-router'
import Overview from './views/Overview.vue'
import Admin from './views/Admin.vue'
import Setup from './views/Setup.vue'
import ErrorView from './views/Error.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Overview',
      component: Overview
    },{
      path: '/Admin',
      name: 'Administration',
      component: Admin
    },{
      path: '/Setup',
      name: 'Setup',
      component: Setup
    },{
      path: '/Error',
      name: 'Error',
      component: ErrorView
    }
  ]
})