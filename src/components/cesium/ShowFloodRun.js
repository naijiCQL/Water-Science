/*
 * @Author: 陈巧龙
 * @Date: 2023-08-01 16:59:44
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 15:27:11
 * @FilePath: \ys.skxlsyb\src\components\cesium\ShowFloodRun.js
 * @Description: 展示洪水淹没效果
 */
/* eslint-disable */
import * as turf from '@turf/turf'
import { getYMData } from "@/api/home"
import { removeEntities } from './ShowResWaterPos'
import { convertUTMToWGS84 } from "./AddSurfaceTexture";

var endTime = null  //用于保存结束时间
var timer = null //定义一个定时器
var currentTime = null //用于保存当前时间
const waterPrimitive = [] //定义数组保存水面数据
const areaEntity = [];// 创建一个数组来存储上一个显示面积的实体

/**
 * @description: 将时间进行格式化方便传递给后端
 * @param {*} date
 * @return {*}
 */
export function formatDate(date) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${day}${month}${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * @description: 得到第一时刻的水面绘制、演进结束时间、绘制水面、标志当前淹没水面
 * @param {*} param
 * @param {*} waterEntity
 * @param {*} waterHeight
 * @param {*} ymAreaData
 * @return {*}
 */
export function getResYMData(param, waterEntity, waterHeight, ymAreaData) {
    getYMData(param).then(res => {
        //将演进结束时间进行保存
        if (!endTime) {
            endTime = res.data.properties.endTime
        }
        //获得每个时间点的淹没面积数据
        let ymArea = parseInt(res.data.properties.area)
        //得到后端传来某个时间点的河流水面数据
        let coordinates = res.data.geometry.coordinates;
        //将投影坐标数据进行批量处理
        const wgs84Coordinates = coordinates.map(coord => convertUTMToWGS84(coord[0], coord[1]));

        // 先移除上一个显示淹没面积的实体
        removeEntities(areaEntity);

        /* 计算多边形的质心坐标 */
        let mutableCoordinates = wgs84Coordinates.slice();//复制数组,将数组进行改变
        mutableCoordinates.push(wgs84Coordinates[0]);
        const editPolygon = mutableCoordinates;

        //使用turf库函数计算多边形的质心坐标
        let polygon = turf.polygon([editPolygon]);
        let centroid = turf.centroid(polygon).geometry.coordinates;

        //显示淹没面积标注,并且将其保存到数组里面
        const entity = addAreaLabel(centroid[0], centroid[1], ymArea, waterHeight + 15)
        areaEntity.push(entity)
        if (ymAreaData) {
            ymAreaData.push(entity)
        }

        let positions = [].concat.apply([], wgs84Coordinates);

        //定义河流水面材质
        const material = new Cesium.Material({
            fabric: {
                type: "Water",
                uniforms: {
                    baseWaterColor: Cesium.Color.AQUA.withAlpha(0.3),
                    normalMap: require("@/assets/image/marker/水面.jpg"),
                    frequency: 1000, //水波纹数量
                    animationSpeed: 0.03, //水的流速
                    amplitude: 10, //水面波纹振幅
                    specularIntensity: 5 //镜面反射强度
                },
            },
        });

        const instance = new Cesium.GeometryInstance({
            geometry: Cesium.PolygonGeometry.fromPositions({
                positions: Cesium.Cartesian3.fromDegreesArray(positions),
                height: waterHeight,
            }),
            attributes: {
                distanceDisplayCondition:
                    new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(0, 15000),
            },
        });

        const primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material: material,
                aboveGround: false,
            }),
            show: true,
            asynchronous: false,// 确定基元是异步创建还是阻塞直到准备就绪
            releaseGeometryInstances: false,
        })

        waterPrimitive.push(primitive)

        if (waterEntity) {
            waterEntity.push(primitive)
        }

        window.viewer.scene.primitives.add(primitive);

        // 移除前n-1个 Primitive(n>1)
        if (waterPrimitive.length > 1) {
            for (let i = 0; i < waterPrimitive.length - 1; i++) {
                const primitiveToRemove = waterPrimitive[i];
                if (primitiveToRemove) {
                    window.viewer.scene.primitives.remove(primitiveToRemove);
                }
            }
        }
    })
        .catch(error => {
            console.log(error);
        });
}

/**
 * @description: 展示水库淹没效果动画，并且保存淹没实体
 * @param {*} resYMInfo
 * @param {*} timestep
 * @param {*} waterHeight
 * @param {*} waterEntity
 * @param {*} ymAreaData
 * @return {*}
 */
export function showRiverRun(resYMInfo, timestep, waterHeight, waterEntity, ymAreaData) {
    //获得每个时刻的淹没面数据
    getResYMData(resYMInfo, waterEntity, waterHeight, ymAreaData)
    //记录当前时间
    currentTime = new Date(new Date(resYMInfo[1]).getTime() + timestep * 60 * 1000)
    // 创建定时器
    timer = setInterval(() => {
        // 如果 currentTime 超过了结束时间，清除定时器
        if (currentTime.getTime() === new Date(endTime).getTime()) {
            clearInterval(timer);
            timer = null;
        }
        //将方案名称和水库编码进行保存
        var faName = resYMInfo[0]
        var resName = resYMInfo[2]
        //存入数据前进行数组清空
        resYMInfo = []
        //将新的[方案名称，淹没时间点，水库编码]再保存起来
        resYMInfo.push(faName, formatDate(currentTime), resName)
        //再次绘制每个时刻的淹没面数据
        getResYMData(resYMInfo, waterEntity, waterHeight, ymAreaData)
        // 将当前时间按照时间步长往后进行推进
        currentTime = new Date(currentTime.getTime() + timestep * 60 * 1000);

    }, 3000);
}

/**
 * @description:将定时器进行关闭并且将当前淹没时间进行发送
 * @return {*} currentTime
 * @return {*} new Date(endTime)
 */
export function sendCurrendTime() {
    clearInterval(timer);
    timer = null;
    return [currentTime, new Date(endTime)]
}

/**
 * @description: 添加当前淹没面积的标识
 * @param {*} long
 * @param {*} lat
 * @param {*} area
 * @param {*} labelHeight
 * @return {*}
 */
function addAreaLabel(long, lat, area, labelHeight) {
    return window.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(long, lat, labelHeight),
        label: {
            text: `淹没面积${area}m²`,
            scale: 1,
            font: '8px sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#ffffff'), // 设置白色填充颜色
            outlineColor: Cesium.Color.fromCssColorString('#000000'), // 设置黑色边框颜色
            outlineWidth: 5, // 设置边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            pixelOffset: new Cesium.Cartesian2(0, 0),
            eyeOffset: new Cesium.Cartesian3(0, 0, 0),
            scaleByDistance: new Cesium.NearFarScalar(200, 2, 1660, 0),
        },
    });
}

/**
 * @description: 删除产生的水体
 * @param {*} waterPrimitive
 * @return {*}
 */
export function deleteWaterEntity(waterPrimitive) {
    for (let i = 0; i < waterPrimitive.length; i++) {
        window.viewer.scene.primitives.remove(waterPrimitive[i]);
    }

}