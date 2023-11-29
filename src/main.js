/*
 * @Author: 杨道博
 * @Date: 2023-07-06 11:10:37
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-08 16:12:31
 * @Description: 
 * @FilePath: \ys.skxlsyb\src\main.js
 */


import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/style/base.scss'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import * as echarts from "echarts";

Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false
Vue.use(ElementUI); //全局引入
Vue.use(store)
Vue.prototype.$bus = new Vue()//全局引入bus

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
