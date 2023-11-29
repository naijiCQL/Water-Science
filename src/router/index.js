/*
 * @Author: 杨道博
 * @Date: 2023-07-06 11:10:37
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-08-18 10:19:06
 * @Description: 路由配置
 * @FilePath: \ys.skxlsyb\src\router\index.js
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
