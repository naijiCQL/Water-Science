/*
 * @Author: 陈巧龙
 * @Date: 2023-07-29 16:12:58
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-25 16:14:10
 * @FilePath: \ys.skxlsyb\src\components\cesium\AddBoundary.js
 * @Description: 添加湖北各城市的边界，并为湖北省做遮罩效果
 */
/* eslint-disable */
import { getHubeiallMapJson } from "./hubeiData";

/**
 * @description: 添加湖北省的遮罩效果
 * @return {*}
 */
export function overlayEntity() {

    let features = getHubeiallMapJson().features[0].geometry.coordinates[0];
    let positionArray1 = [].concat.apply([], features[0]);

    // 遮罩
    let polygonEntity = new Cesium.Entity({
        polygon: {
            hierarchy: {
                // 添加外部区域为1/4半圆，设置为180会报错
                positions: Cesium.Cartesian3.fromDegreesArray([0.000001, 89, 0.000001, -89, 180, -89, 180, 89]),
                // 中心挖空的“洞”
                holes: [{
                    positions: Cesium.Cartesian3.fromDegreesArray(positionArray1)
                }]
            },
            material: new Cesium.Color(98, 98, 95, 0.5)
        }
    })

    let polygonEntity1 = new Cesium.Entity({
        polygon: {
            hierarchy: {
                positions: Cesium.Cartesian3.fromDegreesArray([-0.000001, 89, -0.000001, -89, -180, -89, -180, 89]),
            },
            material: new Cesium.Color(98, 98, 95, 0.5)
        }
    })
    window.viewer.entities.add(polygonEntity);
    window.viewer.entities.add(polygonEntity1);

}
/**
 * @description: 给添加的geojson数据标注信息
 * @param {*} geojson
 * @param {*} cityStats
 * @return {*}
 */
export function addGeoJSON(geojson, cityStats) {
    // 将GeoJSON转换为Cesium Entity
    var promise = Cesium.GeoJsonDataSource.load(geojson);
    // 遍历所有特征并为每个特征添加标签
    for (const feature of geojson.features) {
        const adcode = feature.properties.adcode;
        const center = feature.properties.centroid;
        const name = feature.properties.name;
        cityStats.push({ name: name, center: center, adcode: adcode });

        const entity = window.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
            label: {
                text: name,
                font: '17px sans-serif',
                fillColor: Cesium.Color.fromCssColorString('#ffffff'), // 设置白色填充颜色
                outlineColor: Cesium.Color.fromCssColorString('#000000'), // 设置黑色边框颜色
                outlineWidth: 6, // 设置边框宽度
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(8, -8),
            },
            description: name
        });

        // 监听视图变化事件
        window.viewer.scene.postRender.addEventListener(function () {
            const currentHeight = window.viewer.camera.positionCartographic.height;
            if (currentHeight < 2200000 && currentHeight > 0) {
                // 在合适的层级范围内显示实体
                entity.show = true;
            } else {
                // 不在合适的层级范围内隐藏实体
                entity.show = false;
            }
        });
    }
    //为添加的json数据添加样式效果
    promise.then(function (dataSource) {
        dataSource.entities.values.forEach(element => {
            element.polygon.outlineColor = Cesium.Color.fromCssColorString('#85C1E9').withAlpha(0.5); // 浅蓝绿色
            element.polygon.material = Cesium.Color.TRANSPARENT;
        });
        window.viewer.dataSources.add(dataSource);
    })

}