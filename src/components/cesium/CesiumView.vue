<!--
 * @Author: 杨道博
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-10-10 09:07:17
 * @FilePath: \ys.skxlsyb\src\components\cesium\CesiumView.vue
 * @Description: cesium组件
-->

<template>
    <div class="cesium-page">
        <div id="cesium">
        </div>
        <div class="switch" v-if="switchVisible">
            <span style="color: white;margin-right: 5px;">BIM模型</span>
            <el-switch v-model="switchValue" active-color="#13ce66" inactive-color="#ff4949" @change="changeValue">
            </el-switch>
        </div>
        <span @click="reset" class="newBtn" v-if="isVisible"><img style="height: 3vh;"
                src="../../assets/image/marker/当前定位.png" /></span>
        <PlaySet></PlaySet>
    </div>
</template>

<script>
import PlaySet from './PlaySet.vue';
import { getHubeiMapJson } from "./hubeiData";
import { selectRegion, skipMap } from "./CesiumEvent"
import { addLocationWidget } from "./AddLocationWidget";
import { getYsyJson, getJpJson } from "./reservoirData";
import { addGeoJSON, overlayEntity } from "./AddBoundary";
import { createWaterSurface, addResLabel } from "./AddSurfaceTexture";
import { showRiverRun, sendCurrendTime, formatDate } from "./ShowFloodRun"
import { receiveResNumber, showResWaterPos, rePosition, addEntities } from "./ShowResWaterPos"

export default {
    name: "CesiumView",
    components: {
        PlaySet,
    },
    data() {
        return {
            //储存各城市的名字、中心以及城市编码
            cityStats: [],
            //储存各城市的中心坐标和编码
            cityCenterCode: [],
            //用于获取水库淹没信息(方案名称+时间点+水库编号)
            resYMInfo: [],
            //是否显示地图定位
            isVisible: false,
            //保存时间步长
            timeStep: null,
            //记录加载实景的数量
            entityNumber: 0,
            //控制是否显示开关
            switchVisible: false,
            //记录开关的状态
            switchValue: false,
            //记录水库编码
            reservoirCode: null,
        }
    },
    mounted() {
        //初始化cesium三维地球
        this.initCesium();

        //接受湖北省各城市的水库数量，用于显示在标签上
        receiveResNumber('420000000000')

        //接受headerView传来的水库编码
        this.$bus.$on("rc", (value) => {
            //保存水库编码
            this.reservoirCode = value
            //显示开关
            this.switchVisible = true
            //关闭开关内容
            this.switchValue = false
            //根据不同水库编码进行定位
            if (value === '42128140006') {
                if (this.entityNumber) {
                    window.viewer.scene.layers.remove('Combine')
                    window.viewer.scene.layers.remove('BIMyangshuyanCache')
                    window.viewer.scene.layers.remove('yangshuyan')
                    window.viewer.scene.layers.remove('jinpen')
                    window.viewer.scene.layers.remove('yangshuyanbim')
                }
                let jpPromise = window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-jinpen/rest/realspace")
                jpPromise.then(() => {
                    this.entityNumber++
                });
                setTimeout(() => {
                    skipMap(114.0452209135, 29.7572527419, 1000.0)
                }, 500);
            } else {
                if (this.entityNumber) {
                    window.viewer.scene.layers.remove('jinpen')
                    window.viewer.scene.layers.remove('Combine')
                    window.viewer.scene.layers.remove('yangshuyan')
                    window.viewer.scene.layers.remove('BIMyangshuyanCache')
                    window.viewer.scene.layers.remove('yangshuyanbim')
                }
                let ysyPromise = window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-yangshuyan/rest/realspace")
                ysyPromise.then(() => {
                    this.entityNumber++
                });
                setTimeout(() => {
                    skipMap(114.3243280000, 31.3057960000, 800.0)
                }, 500);
            }
        });

        //接受headerView传来的水库编码
        this.$bus.$on("ymTimeStep", (value) => {
            this.timeStep = value
        });

        //接受Dhfasz组件传来的[方案名称，开始时间，水库编码]数据
        this.$bus.$on("faData", (value) => {
            //保存水库编码
            this.reservoirCode = value[2]
            //显示开关按钮
            this.switchVisible = true
            //关闭开关内容
            this.switchValue = false
            //将水库信息进行保存
            this.resYMInfo = value
            //根据不同水库编码进行定位
            if (value[2] === '42128140006') {
                if (this.entityNumber) {
                    window.viewer.scene.layers.remove('Combine')
                    window.viewer.scene.layers.remove('BIMyangshuyanCache')
                    window.viewer.scene.layers.remove('yangshuyan')
                    window.viewer.scene.layers.remove('jinpen')
                    window.viewer.scene.layers.remove('yangshuyanbim')
                }
                let jpPromise = window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-jinpen/rest/realspace")
                jpPromise.then(() => {
                    this.entityNumber++
                });
                setTimeout(() => {
                    skipMap(114.0452209135, 29.7619927419, 3176.0)
                }, 500);

                // 调用封装的函数，并获取返回的对象
                showRiverRun(this.resYMInfo, this.timeStep, 95);
            } else if (value[2] === '42011640018') {
                if (this.entityNumber) {
                    window.viewer.scene.layers.remove('Combine')
                    window.viewer.scene.layers.remove('BIMyangshuyanCache')
                    window.viewer.scene.layers.remove('yangshuyan')
                    window.viewer.scene.layers.remove('jinpen')
                    window.viewer.scene.layers.remove('yangshuyanbim')
                }
                let ysyPromise = window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-yangshuyan/rest/realspace")
                //window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-yangshuyanbim/rest/realspace")
                ysyPromise.then(() => {
                    this.entityNumber++
                });
                setTimeout(() => {
                    skipMap(114.3243280000, 31.3036960000, 1456.0)
                }, 500);

                // 调用封装的函数，并获取返回的对象
                showRiverRun(this.resYMInfo, this.timeStep, 70);
            }
        });

        //接受Dhfasz组件传来的停止播放的命令
        this.$bus.$on("runStop", (value) => {
            if (value) {
                let currentEndTime = sendCurrendTime()
                let currentNameTime = []
                currentNameTime.push(this.resYMInfo[0], formatDate(currentEndTime[0]), formatDate(currentEndTime[1]))
                this.$bus.$emit("currentNameTime", currentNameTime);
            }
        });

        //接受homeView.vue的各城市编码
        this.$bus.$on("resCode", (value) => {
            selectRegion(this.cityCenterCode, this.cityStats, value);
            if (value && value !== '420000') {
                showResWaterPos(value);
                this.isVisible = true;
            } else {
                this.isVisible = false;
            }
        });

        //接受ZhpgView.vue的各城市编码
        this.$bus.$on("mapData", (value) => {
            for (let i = 0; i < value.length; i++) {
                const entity = addEntities(value[i], "/地点.png", 0.1, 25, '#FFFF00')
                this.$bus.$emit("villageSign", entity);
            }
        });
    },
    methods: {
        /* eslint-disable */
        /**
         * @desc: cesium球初始化
         * @return {*}
         */
        initCesium() {
            //天地图影像底图
            // const tdt_yx = new Cesium.WebMapTileServiceImageryProvider({
            //     url: "https://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=5f6ce53dd610e53cd0181e10c53c69ae",
            //     layer: "tdtBasicLayer",
            //     style: "default",
            //     format: "image/jpeg",
            //     tileMatrixSetID: "GoogleMapsCompatible",
            //     subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            //     minimumLevel: 0,
            //     maximumLevel: 20,
            // });
            //加载cesium的token
            Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZThjZTYxZC1jNWNmLTQ0ZWYtYTI1MC1kMTkwOTNmMzhmNjgiLCJpZCI6MTE1OTkwLCJpYXQiOjE2NjkyOTkxNjR9.F9i1_DDMoKb1DoyHj1bP4Rq2oZBK4JSlQBMl-feliVI';
            //地形
            const terrainLayer = new Cesium.CesiumTerrainProvider({
                url: "https://data.mars3d.cn/terrain",
            });
            //初始页面的加载
            window.viewer = new Cesium.Viewer("cesium", {
                animation: false, // 是否创建动画小器件， 左下角仪表盘
                baseLayerPicker: false, //是否显示图层切换选择器
                fullscreenButton: false, //是否显示全屏按钮
                geocoder: false, //是否显示geocoder小器件，右上角查询按钮
                homeButton: false, //是否显示Home按钮
                infoBox: false, //是否显示信息框
                sceneModePicker: false, //是否显示3D/2D选择器
                selectionIndicator: false, //是否显示选取指示器组件
                shouldAnimate: true, //控制Cesium动画的启用和禁用
                timeline: false, //是否显示时间轴
                navigationHelpButton: false, //是否显示右上角的帮助按钮
                scene3DOnly: true, // 如果设置为true, 则所有的几何图形以3D模式绘制以节约GPU资源
                // imageryProvider: tdt_yx,//添加天地图影像底图
                terrainProvider: terrainLayer,//添加地形文件
            });
            //设置相机高度范围
            window.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 22000000; //相机最大高度
            window.viewer.scene.screenSpaceCameraController._maximumZoomRate = 5906376272000;
            //隐藏logo
            window.viewer._cesiumWidget._creditContainer.style.display = "none";
            //屏蔽左键双击
            window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
                Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
            );
            //初始化页面定位视角
            window.viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(112.537035, 30.118797, 1000000.0),
                orientation: {
                    heading: Cesium.Math.toRadians(4.0),
                    pitch: Cesium.Math.toRadians(-84.0),
                    roll: 0.0,
                },
                duration: 2
            });

            //加载湖北省各城市的边界
            addGeoJSON(getHubeiMapJson(), this.cityStats);

            //添加遮罩效果
            overlayEntity()

            // 为杨树堰和金盆水库添加动态纹理
            createWaterSurface(getYsyJson(), 84)
            createWaterSurface(getJpJson(), 82)

            //为每个水库添加标签以及进行定位
            addResLabel('杨树堰水库', 114.3240870987, 31.3051865687)
            addResLabel('金盆水库', 114.0457381876, 29.7574316020)

            //为地图下边添加提示框信息（经纬度、高度，视角等）
            addLocationWidget(window.viewer, "cesium")
        },
        //复位
        reset() {
            rePosition();
        },
        //打开或者关闭开关
        changeValue() {
            if (this.switchValue) {
                if (this.reservoirCode === '42128140006') {
                    window.viewer.scene.layers.remove('yangshuyanbim')
                    window.viewer.scene.layers.remove('NewDGN2')
                    window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-jinpenbim/rest/realspace")
                } else {
                    window.viewer.scene.layers.remove('yangshuyanbim')
                    window.viewer.scene.layers.remove('NewDGN2')
                    window.viewer.scene.open("https://27.17.47.174:9090/iserver/services/3D-yangshuyanbim/rest/realspace")
                }
            } else {
                window.viewer.scene.layers.remove('yangshuyanbim')
                window.viewer.scene.layers.remove('NewDGN2')
            }
        }
    },
    beforeDestroy() {
        // 销毁Cesium资源
        window.viewer.destroy();
        // 最后在beforeDestroy()生命周期内清除定时器：
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
}
</script>

<style lang="scss" scoped>
.cesium-page {
    width: 100%;
    height: 100vh;
}

#cesium {
    width: 100%;
    height: 100%;
    z-index: 0;
}

.switch {
    position: absolute;
    bottom: 4%;
    right: 2%;
    cursor: pointer;
}

.newBtn {
    position: absolute;
    bottom: 12%;
    right: 2%;
    cursor: pointer;
}
</style>