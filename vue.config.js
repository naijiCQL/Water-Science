/*
 * @Author: 杨道博
 * @Date: 2023-07-06 11:10:37
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-10-23 19:20:03
 * @Description: 
 * @FilePath: \ys.skxlsyb\vue.config.js
 */
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true, //关闭sourcemap
  chainWebpack: (config) => {
    //添加部分webpack设置
    // title修改
    config.plugin("html").tap((args) => {
      args[0].title = " ";
      return args;
    });
    // 路径别名添加
    config.resolve.alias
      .set("components", "@/components")
      .set("assets", "@/assets")
      .set("utils", "@/utils")
      .set("api", "@/api");
  },
  outputDir: "dist",
  assetsDir: "./static",
  configureWebpack: {
    output: {
      sourcePrefix: " ",
    },
    amd: {
      toUrlUndefined: true,
    },
  },
  devServer: {
    historyApiFallback: {
      index: "dist/index.html", //与output的publicPath
    },
    proxy: {
      "/api": {
        //target: "http://10.42.7.148:50001/api",
        //target: 'https://sk.hubeishuiyi.cn/hsybApi/api/fh-admin',
        //target: "https://www.dzsbxt.cn/api",
        target: "http://192.168.20.69:50001/api",
        secure: true, // 如果是https接口，需要配置这个参数
        changeOrigin: true, //是否跨域
        pathRewrite: {
          '^/api': ''
        }
      },
    },
  },
})

