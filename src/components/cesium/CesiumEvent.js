/*
 * @Author: 陈巧龙
 * @Date: 2023-07-31 11:15:06
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 10:04:39
 * @FilePath: \ys.skxlsyb\src\components\cesium\CesiumEvent.js
 * @Description: 为多边形中的label添加点击事件监听器，点击label即点击地图上的名字可获取区域的名字、中心点坐标、城市编码。
 */
/* eslint-disable */
import bus from '@/utils/bus'
import { showResWaterPos } from './ShowResWaterPos'

/**
 * @description: 点击地图上的实体可获取区域的名字、中心点坐标、城市编码以及水库信息
 * @param {*} cityCenterCode
 * @param {*} cityStats
 * @param {*} value
 * @return {*}
 */
export function selectRegion(cityCenterCode, cityStats, value) {
    let scene = window.viewer.scene;
    let handler = new Cesium.ScreenSpaceEventHandler(window.viewer.canvas);
    handler.setInputAction(evt => {
        let position = evt.position; //获取鼠标点击的屏幕坐标
        let pickObj = scene.pick(position); //通过场景拾取，找到与该坐标对应的实体。
        let entityDes = null; //实体的描述信息
        if (pickObj && new Cesium.defined(pickObj)) {
            //取到entity的描述信息
            if (pickObj.id && pickObj.id.description) {
                entityDes = pickObj.id.description.getValue();
            }
        }
        bus.$emit('resName', entityDes);
        //先清空数组
        cityCenterCode = []
        //通过城市名字查找中心点和城市编码
        for (const city of cityStats) {
            if (city.name === entityDes) {
                //将城市的中心坐标、城市编码添加进数组
                cityCenterCode.push(city.center, city.adcode)
            }
        }
        //只有当所处城市以及权限管理员时，才能选择所在城市或城市内各水库
        if (value === cityCenterCode[1] || value === null || value === '420000') {
            if (cityCenterCode.length === 2) {
                //向后端传递城市编码，获取水库经纬度
                showResWaterPos(cityCenterCode[1].toString())
                //定位到城市
                skipMap(cityCenterCode[0][0], cityCenterCode[0][1], 30000)
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/**
 * @description: 跳转地图函数
 * @param {*} longitude
 * @param {*} latitude
 * @param {*} height
 * @return {*}
 */
export function skipMap(longitude, latitude, height) {
    window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
            roll: 0.0,
        },
        duration: 2,
    });
}