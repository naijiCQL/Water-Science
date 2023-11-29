/*
 * @Author: 杨道博
 * @Date: 2023-02-11 16:16:37
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-08-25 15:13:55
 * @Description: 加载倾斜摄影数据
 * @FilePath: \ys.skxlsyb\src\components\cesium\Load3DtilesData.js
 */

import * as Cesium from "cesium/Cesium";

let TilesPrimitives = []; //倾斜影像数据

/**
 * @desc: 添加3dTiles数据
 * @param {*} url 3dTiles数据地址
 * @param {*} height 显示高度
 * @param {*} viewer 球对象
 * @param {*} id 
 * @return {*}
 */
export function load3DTilesLayer(url, height) {
  const tileSetPromise = new Cesium.Cesium3DTileset({
    url: url,
    skipLevelOfDetail: true, //是Cesium在1.5x 引入的一个优化参数，这个参数在金字塔数据加载中，可以跳过一些级别，这样整体的效率会高一些，数据占用也会小一些。但是带来的异常是：1） 加载过程中闪烁，看起来像是透过去了，数据载入完成后正常。2，有些异常的面片，这个还是因为两级LOD之间数据差异较大，导致的。当这个参数设置false，两级之间的变化更平滑，不会跳跃穿透，但是清晰的数据需要更长，而且还有个致命问题，一旦某一个tile数据无法请求到或者失败，导致一直不清晰。所以我们建议：对于网络条件好，并且数据总量较小的情况下，可以设置false，提升数据显示质量。
    baseScreenSpaceError: 256,
    maximumScreenSpaceError: 16, // 【重要】数值加大，能让最终成像变模糊
    skipScreenSpaceErrorFactor: 18,
    skipLevels: 20,
    show: false,
    immediatelyLoadDesiredLevelOfDetail: true,
    loadSiblings: true, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋
    cullWithChildrenBounds: true,
    //cullRequestsWhileMoving: true,
    cullRequestsWhileMovingMultiplier: 0.2, //【重要】 值越小能够更快的剔除
    preloadWhenHidden: false, //tileset.show是false时，也去预加载数据
    preferLeaves: true, //【重要】这个参数默认是false，同等条件下，叶子节点会优先加载。但是Cesium的tile加载优先级有很多考虑条件，这个只是其中之一，如果skipLevelOfDetail=false，这个参数几乎无意义。所以要配合skipLevelOfDetail=true来使用，此时设置preferLeaves=true。这样我们就能最快的看见符合当前视觉精度的块，对于提升大数据以及网络环境不好的前提下有一点点改善意义。
    maximumMemoryUsage: 1024, // 【重要】内存建议显存大小的50%左右，内存分配变小有利于倾斜摄影数据回收，提升性能体验
    progressiveResolutionHeightFraction: 0.5, ////【重要】 数值偏于0能够让初始加载变得模糊
    dynamicScreenSpaceErrorDensity: 1, // 数值加大，能让周边加载变快
    dynamicScreenSpaceErrorFactor: 4, // 不知道起了什么作用没，反正放着吧先
    dynamicScreenSpaceError: true, // true时会在真正的全屏加载完之后才清晰化模型
    backFaceCulling: true, // 不剔除 双面渲染
  });

  let primitive = window.viewer.scene.primitives.add(tileSetPromise); // 将倾斜摄影实体加载到地图上
  TilesPrimitives.push(primitive);

  //cesium版本>= 1.92的使用
  // tileSetPromise.readyPromise
  //   .then((tileSet) => {
  //     changeHeight(tileSet, height);
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
  //cesium版本< 1.92的使用
  tileSetPromise.readyPromise
    .then((tileSet) => {
      changeHeight(tileSet, height);
    })
    .otherwise(function (error) {
      console.log(error);
    });

  //修改倾斜的高度
  function changeHeight(tileSet, height) {
    height = Number(height);
    if (isNaN(height)) {
      return;
    }
    const cartographic = Cesium.Cartographic.fromCartesian(
      tileSet.boundingSphere.center
    );
    const surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      cartographic.height
    );
    const offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      height
    );
    const translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileSet.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
  }

  return primitive;
}

/**
 * @desc: 移除倾斜影像数据
 * @param {*} viewer
 * @return {*}
 */
export function remove3DTiles() {
  TilesPrimitives.forEach(p =>{
    window.viewer.scene.primitives.remove(p);
  })
}
