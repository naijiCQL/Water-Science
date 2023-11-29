/*
 * @Author: 杨道博
 * @Date: 2023-05-23 17:52:59
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-08-28 15:16:59
 * @Description: 基础信息
 * @FilePath: \ys.skxlsyb\src\store\modules\user.js
 */

const state = {
  token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJBRE1JTiIsIlVzZXJJZCI6IjEiLCJzY29wZSI6WyJhbGwiXSwiVXNlclJlYWxOYW1lIjoi6LaF57qn566h55CG5ZGYIiwiVXNlclh6cWhkbSI6IjQyMDUiLCJleHAiOjI1MTk3NzIwMTAsImp0aSI6ImExNTcxYzk1LTBkNjMtNDkyYi1iOWEyLTE2ZTIzNTQ5ZTY1ZiIsImNsaWVudF9pZCI6InVzZXItc2VydmljZSJ9.ebNVZrw9LbhKaj2w6RR8b2wccQiDkhvBeq79SxxCK-yWiOlIFqBkotTN4TNJg8umcpyYvLILwvqXWRJhffEtgi25sX2y6MqLIWM4kMZ9d8ptdnSmTpBPhltSiQOM0KFa1kl5nSDCBwYOLn-pESJglam76cjpgZNoC88x3iNHacdiXDItY0rtY85HrQ26uyJu9UovKtmYmZRHsIbGMpDta5Q1p4vfaCIr-YUayDrCweZJiQDEEcOSpWJ7O7RMk3pRkX_4UmPHFzrOI2lMp1jQIhxnSTE7EVAz_4z8h8r46muSkpF54Ic4XSawHKqdSLHx8T05LB0MpvOzWMPS6c1uHA", //token
  userInfo: JSON.parse(localStorage.getItem("userInfo")) || {}, //登录用户基本信息
};

const getters = {};

const mutations = {
  setToken(state, token) {
    localStorage.setItem("token", token);
    state.token = token;
  },
  setUserInfo(state, userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    state.userInfo = userInfo;
  },
};

const actions = {
  // 退出登录
  logoutAct(context) {
    localStorage.clear();
    sessionStorage.clear();
    context.commit("setToken", "");
    context.commit("setUserInfo", {});
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
