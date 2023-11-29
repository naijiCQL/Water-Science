/*
 * @Author: 陈巧龙
 * @Date: 2023-08-31 16:28:43
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 15:23:55
 * @FilePath: \ys.skxlsyb\src\components\cesium\trackView.js
 * @Description: 根据规划的路线实现漫游效果
 */
/* eslint-disable */

/**
 * @description: 设置起止时间以及进行漫游
 * @param {*} myPositions //漫游路线的json数据
 * @return {*}
 */
export function trackView(myPositions) {
    //设置开始时间和结束时间
    var start = Cesium.JulianDate.fromDate(new Date(2023, 8, 3, 8));
    var stop = Cesium.JulianDate.addSeconds(
        start,
        myPositions.length - 1,
        new Cesium.JulianDate()
    );

    window.viewer.clock.startTime = start.clone();
    window.viewer.clock.stopTime = stop.clone();
    window.viewer.clock.currentTime = start.clone();
    window.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    window.viewer.timeline.zoomTo(start, stop);

    var position = computeCirclularFlight(myPositions);

    //创建实体
    var entity = window.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
                start: start,
                stop: stop,
            }),
        ]),
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        // model: {
        //     uri: '/Cesium_Air.glb',
        //     minimumPixelSize: 250,
        // },
        path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.GREEN,
            }),
            width: 0,
        },
    });
    window.viewer.trackedEntity = entity;

    var scratch = new Cesium.Matrix4();
    var renderListener = () => {
        if (window.viewer.trackedEntity) {
            getModelMatrix(window.viewer.trackedEntity, window.viewer.clock.currentTime, scratch);
            var transformX = 250; //距离运动点的距离（后方）
            var transformZ = 100; //距离运动点的高度（上方）
            var transformY = 0; //距离运动点的高度（侧方）
            window.viewer.scene.camera.lookAtTransform(
                scratch,
                new Cesium.Cartesian3(-transformX, transformY, transformZ)
            );
        }
    };
    window.viewer.scene.preRender.addEventListener(renderListener);
}

/**
 * @description: 计算实体的飞行的路线
 * @return {*}
 */
function computeCirclularFlight(myPositions) {
    var property = new Cesium.SampledPositionProperty();
    var start = Cesium.JulianDate.fromDate(new Date(2023, 8, 3, 8));
    //设置插入选项
    property.setInterpolationOptions({
        interpolationDegree: 2,
        interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    for (var i = 0; i < myPositions.length; i++) {
        var time = Cesium.JulianDate.addSeconds(
            start,
            i,
            new Cesium.JulianDate()
        );
        var position = Cesium.Cartesian3.fromDegrees(
            myPositions[i][0],
            myPositions[i][1],
            150,
        );
        property.addSample(time, position);
    }
    return property;
}

/**
 * @description: 视角变换
 * @param {*} entity
 * @param {*} time
 * @param {*} result
 * @return {*}
 */
function getModelMatrix(entity, time, result) {
    var matrix3Scratch = new Cesium.Matrix3();
    var position = Cesium.Property.getValueOrUndefined(
        entity.position,
        time,
        new Cesium.Cartesian3()
    );
    if (!Cesium.defined(position)) {
        return undefined;
    }
    var orientation = Cesium.Property.getValueOrUndefined(
        entity.orientation,
        time,
        new Cesium.Quaternion()
    );
    if (!Cesium.defined(orientation)) {
        result = Cesium.Transforms.eastNorthUpToFixedFrame(
            position,
            undefined,
            result
        );
    } else {
        result = Cesium.Matrix4.fromRotationTranslation(
            Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
            position,
            result
        );
    }
    return result;
}