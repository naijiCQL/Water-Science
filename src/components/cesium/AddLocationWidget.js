/*
 * @Author: 杨道博
 * @Date: 2023-07-06 13:57:58
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-09 14:10:46
 * @Description: 添加底部信息栏
 * @FilePath: \ys.skxlsyb\src\components\cesium\AddLocationWidget.js
 */
/* eslint-disable */
/**
 * @desc: 添加底部鼠标信息
 * @param {*} viewer
 * @param {*} viewerId
 * @return {*}
 */
export function addLocationWidget(viewer, viewerId) {
    //函数节流
    let throttle = (fn, interval) => {
        let __self = fn, // 保存需要被延迟执行的函数引用
            timer, // 定时器
            firstTime = true; // 是否是第一次调用
        return function () {
            let args = arguments,
                __me = this;
            if (firstTime) {
                // 如果是第一次调用，不需延迟执行
                __self.apply(__me, args);
                return (firstTime = false);
            }
            if (timer) {
                // 如果定时器还在，说明前一次延迟执行还没有完成
                return false;
            }
            timer = setTimeout(function () {
                // 延迟一段时间执行
                clearTimeout(timer);
                timer = null;
                __self.apply(__me, args);
            }, interval || 500);
        };
    }

    let getCatesian3FromPX = (px) => {
        let cartesian;
        //在模型上提取坐标
        let pickobject = viewer.scene.pick(px); //取模型
        if (viewer.scene.pickPositionSupported && Cesium.defined(pickobject)) {
            cartesian = viewer.scene.pickPosition(px);
            if (cartesian) {
                const pgeo =
                    viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                if (pgeo.height > 0) return cartesian;
            }
        }

        //提取鼠标点的地理坐标
        const pickRay = viewer.scene.camera.getPickRay(px);
        cartesian = viewer.scene.globe.pick(pickRay, viewer.scene);
        return cartesian;
    }

    class LevelDisplay {
        constructor(constructorId) {
            this.id = constructorId || "location-cesium-jwd";
            this.createDiv();
        }
        createDiv() {
            const parent = document.getElementById(this.id);
            const levelDiv = document.createElement("div");
            levelDiv.className = "location-info-content";

            this._levelText = document.createElement("span");
            levelDiv.append(this._levelText);

            parent.append(levelDiv);
        }

        update() {
            const level = getZoomByHeight(viewer);
            this._levelText.innerText = "层级：" + level;
        }
    }
    if (!document.getElementById("location-cesium-jwd")) {
        document
            .getElementById(viewerId)
            .insertAdjacentHTML(
                "afterbegin",
                '<div id="location-cesium-jwd" class="location-bar no-print" ></div>'
            );
    }
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    let tipsDiV = document.getElementById("location-cesium-jwd");

    //添加层级
    const levelDisplay = new LevelDisplay("location-cesium-jwd");
    const levelEvent = () => {
        levelDisplay.update();
    };
    viewer.camera.changed.addEventListener(levelEvent);

    //经纬度信息
    let locationDiv = document.createElement("div");
    locationDiv.className = "location-info-content";
    tipsDiV.append(locationDiv);

    handler.setInputAction(
        throttle(function (movement) {
            let cartesian = getCatesian3FromPX(movement.endPosition);

            if (!cartesian) return;
            let point = Cesium.Cartographic.fromCartesian(cartesian);
            let sss = viewer.camera.position;
            let car = Cesium.Cartographic.fromCartesian(sss);
            let lon = Cesium.Math.toDegrees(point.longitude);
            let lat = Cesium.Math.toDegrees(point.latitude);
            let lonString =
                lon.toFixed(6) >= 0
                    ? "东经 " + lon.toFixed(6)
                    : "西经 " + -lon.toFixed(6);
            let latString =
                lat.toFixed(6) >= 0
                    ? "北纬 " + lat.toFixed(6)
                    : "南纬 " + -lat.toFixed(6);
            locationDiv.innerHTML =
                "<span>经度： " +
                lonString +
                "  °</span>" +
                "<span>纬度： " +
                latString +
                "  °</span>" +
                "<span>海拔： " +
                point.height.toFixed(1) +
                " 米 </span>" +
                "<span>视点高：" +
                car.height.toFixed(1) +
                " 米 </span>" +
                "<span>视角方向：" +
                Cesium.Math.toDegrees(viewer.camera.heading).toFixed(0) +
                " 度 </span>" +
                "<span>俯仰角：" +
                Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(0) +
                " 度 </span>";
        }, 200),
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
}

/**
 * @desc: 计算层级
 * @param {*} viewer
 * @return {*}
 */
export function getZoomByHeight(viewer) {
    const height = Math.ceil(viewer.camera.positionCartographic.height);
    const A = 40487.57;
    const B = 0.00007096758;
    const C = 91610.74;
    const D = -40467.74;
    const lv = Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
    return lv;
}

/**
 * @desc: 获取当前视角参数
 * @param {*} viewer
 * @return {*}
 */
export function nowViewParm(viewer) {
    let hprString =
        " heading:" +
        viewer.camera.heading +
        ", pitch:" +
        viewer.camera.pitch +
        ", roll:" +
        viewer.camera.roll;

    let temp = viewer.scene.globe.ellipsoid.cartesianToCartographic(
        viewer.camera.position
    );
    let latString = Cesium.Math.toDegrees(temp.latitude);
    let logString = Cesium.Math.toDegrees(temp.longitude);
    let nowViewParm = "当前相机参数:" + logString +
        "," +
        latString +
        "," +
        viewer.camera._positionCartographic.height +
        "\n" +
        hprString;
    console.log(nowViewParm);
}

/**
 * @desc: 平滑相机
 * @param {*} viewer 球对象
 * @return {*}
 */
export function soomthCamera(viewer) {
    //TODO 保存相机的6参数 矢量加法
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (e) {
      // 获取当前镜头位置的笛卡尔坐标
      let cameraPos = viewer.camera.position;
      // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
      let ellipsoid = viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(cameraPos);
      // 获取当前坐标系标准/ 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
      let centerLon = parseFloat(
        Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
      );
      let centerLat = parseFloat(
        Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
      );
      // 获取镜头的高度
      let height = cartographic.height;
      if (height < 10000000) return;
      // 滚轮往前滚，镜头拉近
      if (e > 0) {
        // 镜头拉近
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            centerLon,
            centerLat,
            Math.max(
              height / 1.8,
              viewer.scene.screenSpaceCameraController.minimumZoomDistance
            )
          ),
          duration: 0.5,
          easingFunction: Cesium.EasingFunction.CUBIC_OUT,
        });
      } else {
        // 镜头拉远
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            centerLon,
            centerLat,
            Math.min(
              height * 1.8,
              viewer.scene.screenSpaceCameraController.maximumZoomDistance
            )
          ),
          duration: 0.5,
          easingFunction: Cesium.EasingFunction.CUBIC_OUT,
        });
      }
    }, Cesium.ScreenSpaceEventType.WHEEL);
  }
