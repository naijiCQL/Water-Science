<!--
 * @Author: 杨道博
 * @Date: 2023-07-06 11:10:37
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-08-21 14:34:04
 * @Description: 系统入口
 * @FilePath: \ys.skxlsyb\src\App.vue
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

// 修改全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  box-shadow: 0px 1px 3px #00a0e9 inset;
  /*滚动条的内阴影*/
  border-radius: 10px;
  /*滚动条的圆角*/
  background-color: #00a0e9;
  /*滚动条的背景颜色*/
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: 0px 1px 3px transparent inset;
  /*滚动条的背景区域的内阴影*/
  border-radius: 10px;
  /*滚动条的背景区域的圆角*/
  background-color: transparent;
  /*滚动条的背景颜色*/
}

</style>
