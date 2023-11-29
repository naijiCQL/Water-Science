/*
 * @Author: 陈巧龙
 * @Date: 2023-08-18 13:30:04
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-11-01 15:42:14
 * @FilePath: \ys.skxlsyb\src\components\cesium\ShowResWaterPos.js
 * @Description: 通过传参的形式标注各城市的数量以及获得各城市的水库位置（有无库容水库）
 */
/* eslint-disable */
import bus from '@/utils/bus'
import { skipMap } from "./CesiumEvent"
import { getResWaterPosition, getResNumber } from "@/api/home"

const previousCityEntities = []; // 创建一个数组来存储上一个城市的水库实体
let cityCenterCode = [] //创建一个数组用来保存城市的中心坐标
let citiesData = [] //将后端读取的各城市的水库数量进行保存

/**
 * @description: 获取湖北省各个城市的水库数量用于标绘在地图上
 * @param {*} param
 * @return {*}
 */
export function receiveResNumber(param) {
    getResNumber(param).then(res => {
        /* 由于数据有误，暂时不读取省直管水库数量 */
        // citiesData = res.data.slice(0, res.data.length - 1);
        citiesData = res.data.slice(0, res.data.length);
        // 遍历数组，为每个城市添加水库数量的广告牌
        citiesData.forEach(cityData => {
            const reservoirCount = cityData.cnt;
            const centroid = cityData.centroid;
            // 添加广告牌到 Cesium 的 viewer.entities
            const entity = window.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(centroid[0], centroid[1], 0),
                label: {
                    text: reservoirCount,
                    scale: 0.5,
                    font: '30px sans-serif',
                    fillColor: Cesium.Color.fromCssColorString('#FFA500'), // 橙色
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 5,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    showBackground: false,
                    pixelOffset: new Cesium.Cartesian2(0, -70),
                    eyeOffset: new Cesium.Cartesian3(0, 0, -5)
                },
                billboard: {
                    image: require("@/assets/image/marker/city_res_number.png"),
                    scale: 1.4,
                    sizeInMeters: false,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 20),
                    alignedAxis: new Cesium.Cartesian3(-1, -1, -1),
                    rotation: 0,
                    scaleByDistance: new Cesium.NearFarScalar(20000, 1, 8000000, 0.1),
                },
            });

            // 监听视图变化事件
            window.viewer.scene.postRender.addEventListener(function () {
                const currentHeight = window.viewer.camera.positionCartographic.height;
                if (currentHeight < 2200000 && currentHeight > 500000) {
                    // 在合适的层级范围内显示实体
                    entity.show = true;
                } else {
                    // 不在合适的层级范围内隐藏实体
                    entity.show = false;
                }
            });
        });
    })
        .catch(error => {
            console.log(error);
        });
}

/**
 * @description: 根据各城市编码显示各水库位置与名字
 * @param {*} params
 * @return {*}
 */
export function showResWaterPos(params) {
    getResWaterPosition(params).then(res => {
        let centerPosition = res.data[res.data.length - 1]
        //定位到所输入城市的中心
        skipMap(Number(centerPosition.center_long), Number(centerPosition.center_lat), 45000)

        cityCenterCode = []

        cityCenterCode.push(Number(centerPosition.center_long), Number(centerPosition.center_lat))

        //根据是否定位到武汉来进行选择框的是否禁用
        if (centerPosition.center_long === '114.348204' && centerPosition.center_lat === '30.623025') {
            bus.$emit('selectRes', true);
        } else {
            bus.$emit('selectRes', false);
        }

        const resData = res.data.slice(0, res.data.length - 1);
        // 先移除上一个城市的各水库实体
        removeEntities(previousCityEntities);

        resData.forEach(reservoirData => {
            const reservoirName = reservoirData.name;
            const center_long = Number(reservoirData.center_long);
            const center_lat = Number(reservoirData.center_lat)
            const resKr = reservoirData.isKr
            const resCode = reservoirData.guid
            const resInformation = [reservoirName, [center_long, center_lat], resCode, resKr]

            //根据有无库容进行不同的标识
            if (Number(resKr)) {
                const entity = addEntities(resInformation, "/有库容.svg", 0.5, 15, '#ffffff')
                previousCityEntities.push(entity); // 存储实体到数组
            } else {
                const entity = addEntities(resInformation, "/水库.svg", 0.5, 15, '#ffffff')
                previousCityEntities.push(entity); // 存储实体到数组
            }
        });
    })
        .catch(error => {
            console.log(error);
        });
}

/**
 * @description: 为各有无库容的水库添加指示标签
 * @param {*} resInformation
 * @param {*} picture
 * @param {*} scale
 * @param {*} fontSize
 * @param {*} color
 * @return {*}
 */
export function addEntities(resInformation, picture, scale, fontSize, color) {
    return window.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(resInformation[1][0], resInformation[1][1], 100),
        label: {
            text: resInformation[0],
            font: `${fontSize}px sans-serif`,//3
            fillColor: Cesium.Color.fromCssColorString(color), // 设置填充颜色 '#ffffff'
            outlineColor: Cesium.Color.fromCssColorString('#000000'), // 设置黑色边框颜色
            outlineWidth: 8, // 设置边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            backgroundColor: Cesium.Color.BLACK,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5),
            scaleByDistance: new Cesium.NearFarScalar(50000, 0.8, 60000, 0),
        },
        billboard: {
            image: picture,
            scale: scale,
            sizeInMeters: false,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, 20),
            alignedAxis: new Cesium.Cartesian3(-1, -1, -1),
            rotation: 0,
            scaleByDistance: new Cesium.NearFarScalar(50000, 1, 60000, 0),
        },
        description: resInformation
    });
}

/**
 * @description:用于清空已存储的实体
 * @param {*} entities
 * @return {*}
 */
export function removeEntities(entities) {
    entities.forEach(entity => {
        window.viewer.entities.remove(entity);
    });
    entities.length = 0;
}

/**
 * @description: 复位
 * @return {*}
 */
export function rePosition() {
    skipMap(Number(cityCenterCode[0]), Number(cityCenterCode[1]), 45000)
}