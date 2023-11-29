/*
 * @Author: 陈巧龙
 * @Date: 2023-07-29 15:59:11
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-25 16:17:03
 * @FilePath: \ys.skxlsyb\src\components\cesium\AddSurfaceTexture.js
 * @Description: 为水库添加动态纹理以及添加指示标签
 */
/* eslint-disable */
import proj4 from 'proj4';

/**
 * @description: 绘制水库水面，淹没范围添加动态纹理和高度
 * @param {*} param
 * @param {*} height
 * @param {*} ymEntity
 * @return {*}
 */
export function createWaterSurface(param, height, ymEntity) {
    //将json数据转化为一维数组类型
    const convertedCoordinates = convertCoordinates(param);
    //定义水面材质
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
    // 创建一个 Cesium.GeometryInstance 的实例
    const instance = new Cesium.GeometryInstance({
        geometry: Cesium.PolygonGeometry.fromPositions({
            positions: Cesium.Cartesian3.fromDegreesArray(convertedCoordinates),
             // 指定多边形的高度
            height: height,
        }),
        attributes: {
            // 设置距离显示条件属性，根据距离控制何时显示几何体
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
    });
    //将淹没实体添加
    if (ymEntity) {
        ymEntity.push(primitive)
    }
    window.viewer.scene.primitives.add(primitive);
}

/**
 * @description: 制作水面上升效果
 * @param {*} param
 * @return {*}
 */
export function waterLevelRise(param) {
    const boundary = convertCoordinates(param);
    let riverHeight = 88
    let maxHeight = 89

    let timer = setInterval(() => {
        riverHeight += 0.1
        if (riverHeight >= maxHeight) {
            riverHeight = maxHeight
            clearInterval(timer)
        }
    }, 1000)

    return window.viewer.entities.add({
        polygon: {
            hierarchy: new Cesium.Cartesian3.fromDegreesArray(boundary),
            fill: true,
            material: new Cesium.Color.fromBytes(0, 191, 255, 100), //水面颜色,
            extrudedHeight: new Cesium.CallbackProperty(() => {
                return riverHeight
            }, false),
            clampToGround: true,
        },
    })
}

/**
 * @description: 将geojson数据格式转化为二维数组类型
 * @param {*} jsonData
 * @return {*}
 */
function convertCoordinates(jsonData) {
    const convertedCoordinates = [];
    jsonData.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates[0];
        coordinates.forEach(coord => {
            const [lon, lat] = coord;
            convertedCoordinates.push(lon, lat);
        });
    });
    return convertedCoordinates;
}

/**
 * @description: 将WGS_1984_UTM_Zone_49N投影坐标转为wgs84地理坐标
 * @param {*} x
 * @param {*} y
 * @return {*}
 */
export function convertUTMToWGS84(x, y) {
    const utmZone49Def = '+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
    const wgs84Def = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    var transformPoint = proj4(utmZone49Def, wgs84Def, [x, y]);
    return transformPoint
}

/**
 * @description: 为各个水库添加指示标志
 * @param {*} param
 * @param {*} long
 * @param {*} lat
 * @return {*}
 */
export function addResLabel(param, long, lat) {
    window.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(long, lat, 80),
        label: {
            text: param,
            scale: 1,
            font: '25px sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#ffffff'), // 设置白色填充颜色
            outlineColor: Cesium.Color.fromCssColorString('#000000'), // 设置黑色边框颜色
            outlineWidth: 5, // 设置边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            pixelOffset: new Cesium.Cartesian2(0, 0),
            eyeOffset: new Cesium.Cartesian3(0, 0, -70),
            scaleByDistance: new Cesium.NearFarScalar(3150, 1, 3200, 0),
        },
        description: param
    });
}

/**
 * @description: 添加坝顶高度指示
 * @param {*} resInformation
 * @param {*} picture
 * @param {*} scale
 * @return {*}
 */
export function addDamHeight(resInformation, picture, scale) {
    return window.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(resInformation[1][0], resInformation[1][1], 100),
        label: {
            text: `堰顶高程:${resInformation[0]}m`,
            font: '15px sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#ffffff'), // 设置白色填充颜色
            outlineColor: Cesium.Color.fromCssColorString('#000000'), // 设置黑色边框颜色
            outlineWidth: 8, // 设置边框宽度
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            pixelOffset: new Cesium.Cartesian2(45, -30),
            backgroundColor: Cesium.Color.BLACK,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5),
            scaleByDistance: new Cesium.NearFarScalar(799, 0.8, 800, 0),
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
            scaleByDistance: new Cesium.NearFarScalar(799, 1, 800, 0),
        },
    });
}

