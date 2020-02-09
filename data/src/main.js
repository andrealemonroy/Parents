import Vue from 'vue'
import App from './App.vue'
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
Vue.use(ViewUI);
// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)


Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
