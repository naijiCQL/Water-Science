<!--
 * @Author: 陈巧龙
 * @Date: 2023-08-25 10:03:53
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-10-23 11:05:25
 * @FilePath: \ys.skxlsyb\src\components\cesium\PlaySet.vue
 * @Description:播放设置组件 
-->
<template>
    <div style="width: 100%;height: 100%;">
        <div v-if="bfDisplay" class="bottom-page">
            <span @click="next" v-if="ifPlay"><img style="width: 80%;" src="../../assets/image/marker/播放.png" /></span>
            <span v-else @click="stop"><img style="width: 80%;" src="../../assets/image/marker/停止.png" /></span>
            <el-steps style="width: 80%;" :active="active" finish-status="success">
                <el-step title="预报分析" @click.native="preAnalysis()"></el-step>
                <el-step title="溃坝分析" @click.native="damAnalysis()"></el-step>
                <el-step title="淹没分析" @click.native="floodAnalysis()"></el-step>
                <el-step title="灾后评估" @click.native="disasterAnalysis()"></el-step>
            </el-steps>
        </div>
        <!--预报分析报表页面  -->
        <YbfxView v-if="ybfxDisplay"></YbfxView>
        <!-- 溃坝分析报表页面 -->
        <DamShow v-if="kbDisplay"></DamShow>
        <!-- 灾后评估报表页面 -->
        <ZhpgView v-if="zhpgDisplay"></ZhpgView>
    </div>
</template>
  
<script>
import DamShow from './DamShow.vue';
import ZhpgView from './ZhpgView.vue'
import YbfxView from './YbfxView.vue'
import { skipMap } from "./CesiumEvent"
import { removeEntities } from './ShowResWaterPos'
import { getYsyJson, getJpJson } from './reservoirData'
import { getKbfx, getYmfaEnd } from "@/api/home"
import { createWaterSurface, waterLevelRise, addDamHeight } from './AddSurfaceTexture'
import { showRiverRun, deleteWaterEntity } from "./ShowFloodRun"
// import {  getResYMData } from "./ShowFloodRun"
import { getJpEndData, getYsyEndData } from "./reservoirData"

export default {
    name: 'PlaySet',
    components: {
        DamShow,
        ZhpgView,
        YbfxView
    },
    data() {
        return {
            //默认从第一个进行播放
            active: -1,
            // 用于存储定时器的引用
            timer: null,
            //用于控制播放控件的显示，默认不显示，只有当点击某个水库后才进行显示
            bfDisplay: false,
            //用于控制显示预报分析报表
            ybfxDisplay: false,
            //用于控制显示溃坝分析报表
            kbDisplay: false,
            //用于控制显示灾后评估分析报表
            zhpgDisplay: false,
            //用于保存雨天样式
            lastStage: null,
            //保存水库编码
            resCode: null,
            // 定义每个步骤的延迟时间,按照步骤顺序定义，单位为毫秒
            stepDelays: [10000, 15000, 100000, 15000],
            //储存水库上涨水体的实体
            previousEntities: [],
            // 声明一个变量来存储定时器的标识符
            timerId: null,
            //初始化显示播放按钮
            ifPlay: true,
            //记录所在步骤
            currentStep: null,
            //保存加载的水体
            waterEntity: [],
            //保存村庄标识实体
            signEntity: [],
            //保存淹没数据
            ymData: [],
            //保存堰坝高程实体
            ybHeight: [],
            //保存最后一个时刻的淹没数据
            ymEndData: [],
            //保存淹没面积实体
            ymAreaData: []
        }
    },
    mounted() {
        //接受两个水库的编码
        this.$bus.$on("rc", (value) => {
            this.resCode = value
            this.bfDisplay = true
            //关闭定时器
            clearTimeout(this.timerId);
            //将状态切换为播放状态
            this.ifPlay = true
            /* 切换水库将所有属性再次进行重置 */
            window.viewer.trackedEntity = undefined;
            window.viewer.clock.shouldAnimate = false;
            //将状态重置为最开始状态
            this.active = -1;
            this.ybfxDisplay = false
            this.kbDisplay = false;
            this.zhpgDisplay = false;
            //关闭下雨特效
            this.removeStage();
            //将存在的实体进行删除
            window.viewer.entities.remove(this.previousEntities);
            //根据水库编码获取各水库淹没方案
            this.getResYMMessage(value)
            //删除各步骤所产生的实体
            deleteWaterEntity(this.waterEntity)
            deleteWaterEntity(this.ymEndData)
            removeEntities(this.ymAreaData)
            removeEntities(this.signEntity)
            removeEntities(this.ybHeight)
            //将关闭窗口的命令进行发送
            this.$bus.$emit("closeLsjyyb", true);
        });
        //接受时间步长信息
        this.$bus.$on("timeStep", (value) => {
            this.getKBData([this.resCode, value])
        });
        //关闭溃坝窗口
        this.$bus.$on("closePage", (value) => {
            this.kbDisplay = value
            this.zhpgDisplay = value
        });
        //将村庄水库进行删除
        this.$bus.$on("villageSign", (value) => {
            this.signEntity.push(value)
        });
    },
    methods: {
        /* eslint-disable */
        //执行播放
        next() {
            //显示停止按钮
            this.ifPlay = false
            //进行预报分析事件
            if (this.active === -1) {
                this.preAnalysis();
                this.active++;
            }
            if (this.active >= 0 && this.active <= 2) {
                this.executeStepWithDelay(this.stepDelays[this.active]);
            }
        },
        //停止播放
        stop() {
            //显示播放按钮
            this.ifPlay = true
            // 取消定时器
            clearTimeout(this.timerId);
            /* 切换水库将所有属性再次进行重置 */
            if (this.active === 0) {
                this.active = -1
                this.removeStage();
                for (let i = 0; i < this.previousEntities.length; i++) {
                    window.viewer.entities.remove(this.previousEntities[i]);
                }
            } else if (this.active === 1) {
                this.active = 0
            } else if (this.active === 2) {
                this.active = 1
                //发出关闭的指令
                this.$bus.$emit("runStop", true);
            } else if (this.active === 3) {
                this.active = 2
                this.$bus.$emit("runStop", true);
            } else {
                this.active === -1
            }
            //清除效果
            this.clearEffect()

        },
        //并执行溃坝分析、淹没分析、灾后评估表
        executeStepWithDelay(delay) {
            this.timerId = setTimeout(() => {
                if (this.active === 0) {
                    //移除天气特效
                    this.removeStage();
                    this.damAnalysis()
                } else if (this.active === 1) {
                    /* 执行淹没分析操作 */
                    this.kbDisplay = false;
                    this.floodAnalysis()
                } else if (this.active === 2) {
                    /* 绘制灾后评估报表 */
                    this.zhpgDisplay = true;
                    this.disasterAnalysis()
                } else if (this.active === 3) {
                    this.zhpgDisplay = false;
                }

                this.active++;

                if (this.active <= 3) {
                    this.executeStepWithDelay(this.stepDelays[this.active]);
                } else if (this.active > 3) {
                    this.active = -1
                    //显示播放按钮
                    this.ifPlay = true
                    //将存在的实体进行删除
                    for (let i = 0; i < this.previousEntities.length; i++) {
                        window.viewer.entities.remove(this.previousEntities[i]);
                    }
                }
            }, delay);
        },
        //执行预报分析操作
        preAnalysis() {
            //将预报分析页面进行打开
            this.$bus.$emit("closeLsjyyb", true);
            //清除前一步留下的实体
            this.clearEffect()
            //删除第三步的淹没水体
            deleteWaterEntity(this.waterEntity)
            //删除最后一个时刻的淹没数据
            deleteWaterEntity(this.ymEndData)
            //删除显示淹没面积实体
            removeEntities(this.ymAreaData)
            //记录当前步骤
            this.currentStep = 1
            //将关闭按钮打开
            this.ifPlay = false
            //将预报分析结果进行展示
            this.ybfxDisplay = true
            //为水库都设计合适的定位的角度
            if (this.resCode === "42128140006") {
                window.viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(114.047961, 29.757466, 206.3),
                    orientation: {
                        heading: Cesium.Math.toRadians(264.0),
                        pitch: Cesium.Math.toRadians(-25.0),
                        roll: 0.0,
                    },
                    duration: 2
                });
                this.ybHeight.push(addDamHeight([this.$store.state.ydHeight, [114.0423494053, 29.7562703938]], '/堰顶高程.png', 1))
            } else {
                window.viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(114.32472, 31.307521, 291.3),
                    orientation: {
                        heading: Cesium.Math.toRadians(201.0),
                        pitch: Cesium.Math.toRadians(-29.0),
                        roll: 0.0,
                    },
                    duration: 2
                });
                this.ybHeight.push(addDamHeight([this.$store.state.ydHeight, [114.3224850476, 31.3038825862]], '/堰顶高程.png', 1))
            }
            //执行雨天特效
            this.rainning();
            //进行水面上升
            this.riseWaterLevel();
        },
        //执行溃坝分析操作
        damAnalysis() {
            //将预报分析页面进行关闭
            this.$bus.$emit("closeLsjyyb", false);
            //清除前一步留下的实体
            this.clearEffect()
            //删除第三步的淹没水体
            deleteWaterEntity(this.waterEntity)
            //删除最后一个时刻的淹没数据
            deleteWaterEntity(this.ymEndData)
            //删除显示淹没面积实体
            removeEntities(this.ymAreaData)
            //删除堰顶显示实体
            removeEntities(this.ybHeight)
            //记录当前步骤
            this.currentStep = 2
            //将关闭按钮打开
            this.ifPlay = false
            //将预报分析结果关闭
            this.ybfxDisplay = false
            //为水库都设计合适的定位的角度
            if (this.resCode === "42128140006") {
                window.viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(114.044069, 29.755087, 184.8),
                    orientation: {
                        heading: Cesium.Math.toRadians(303.0),
                        pitch: Cesium.Math.toRadians(-24.0),
                        roll: 0.0,
                    },
                    duration: 2
                });
                //获取溃坝分析数据
                this.getKBData([this.resCode, '60']);
            } else {
                window.viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(114.32202, 31.302861, 161.4),
                    orientation: {
                        heading: Cesium.Math.toRadians(45.0),
                        pitch: Cesium.Math.toRadians(-23.0),
                        roll: 0.0,
                    },
                    duration: 2
                });
                //获取溃坝分析数据
                this.getKBData([this.resCode, '60']);
            }
            /* 绘制溃坝分析报表 */
            this.kbDisplay = true;
        },
        //执行洪水淹没操作
        floodAnalysis() {
            //将预报分析页面进行关闭
            this.$bus.$emit("closeLsjyyb", false);
            //清除前一步留下的实体
            this.clearEffect()
            //删除堰顶显示实体
            removeEntities(this.ybHeight)
            //删除最后一个时刻的淹没数据
            deleteWaterEntity(this.ymEndData)
            //获得村庄的位置
            this.getYmVillage()
            //记录当前步骤
            this.currentStep = 3
            //将关闭按钮打开
            this.ifPlay = false
            /* 执行淹没分析操作 */
            if (this.resCode === "42128140006") {
                skipMap(114.0452209135, 29.7619927419, 3176.0)
                showRiverRun(this.ymData[0][0], this.ymData[0][1], 95, this.waterEntity, this.ymAreaData)
            } else {
                skipMap(114.3243280000, 31.3036960000, 1456.0)
                showRiverRun(this.ymData[0][0], this.ymData[0][1], 70, this.waterEntity, this.ymAreaData)
            }
        },
        //执行绘制灾后评估报表
        disasterAnalysis() {
            //将预报分析页面进行关闭
            this.$bus.$emit("closeLsjyyb", false);
            //清除前一步留下的实体
            this.clearEffect()
            //删除第三步的淹没水体
            deleteWaterEntity(this.waterEntity)
            //删除堰顶显示实体
            removeEntities(this.ybHeight)
            //删除显示淹没面积实体
            removeEntities(this.ymAreaData)
            //记录当前步骤
            this.currentStep = 4
            //将关闭按钮打开
            this.ifPlay = false
            /* 绘制灾后评估报表 */
            if (this.resCode === "42128140006") {
                skipMap(114.0452209135, 29.7619927419, 3176.0)
                // getResYMData(this.ymData[0][2], this.waterEntity, 95)
                createWaterSurface(getJpEndData(), 95, this.ymEndData)
            } else {
                skipMap(114.3243280000, 31.286960000, 8310.0)
                // getResYMData(this.ymData[0][2], this.waterEntity, 70)
                createWaterSurface(getYsyEndData(), 70, this.ymEndData)
            }
            this.zhpgDisplay = true;
        },
        //移除效果图
        removeStage() {
            this.lastStage && window.viewer.scene.postProcessStages.remove(this.lastStage), this.lastStage = null
        },
        //添加下雨的特效
        rainning() {
            const FS_Rain = "uniform sampler2D colorTexture;\n\
				varying vec2 v_textureCoordinates;\n\
			\n\
				float hash(float x){\n\
					return fract(sin(x*133.3)*13.13);\n\
			}\n\
			\n\
			void main(void){\n\
			\n\
				float time = czm_frameNumber / 60.0;\n\
			vec2 resolution = czm_viewport.zw;\n\
			\n\
			vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
			vec3 c=vec3(.6,.7,.8);\n\
			\n\
			float a=-.4;\n\
			float si=sin(a),co=cos(a);\n\
			uv*=mat2(co,-si,si,co);\n\
			uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
			\n\
			float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
			float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*45.;\n\
			c*=v*b; \n\
			\n\
			gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.2);  \n\
			}\n\ ";
            this.removeStage()

            var rain = new Cesium.PostProcessStage({
                name: 'hi_rain',
                fragmentShader: FS_Rain
            });

            window.viewer.scene.postProcessStages.add(rain);

            this.lastStage = rain
        },
        //上升水面
        riseWaterLevel() {
            setTimeout(() => {
                if (this.resCode === '42128140006') {
                    const entity = waterLevelRise(getJpJson())
                    this.previousEntities.push(entity); // 存储实体到数组
                } else {
                    const entity = waterLevelRise(getYsyJson())
                    this.previousEntities.push(entity); // 存储实体到数组
                }
            }, 500);
        },
        //从后端获取溃坝分析结果数据
        getKBData(param) {
            getKbfx(param).then(res => {
                //将溃坝数据进行发送，进行绘图
                this.$bus.$emit("kbdata", res.data);
            }).catch(error => {
                console.log(error);
            });
        },
        //得到淹没村庄的经纬度信息
        getYmVillage() {
            const transformedData = this.$store.state.kbData.data.map(item => [item.hsymcz, [item.lat_x, item.long_y]]);
            this.$bus.$emit("mapData", transformedData);
        },
        //使用模糊方法查询数组的值
        queryData(data, query) {
            const filteredData = Object.keys(data).filter(key => key.includes(query));
            return filteredData.map(key => data[key]);
        },
        //关闭正在进行的步骤
        clearEffect() {
            //删除村庄标识实体
            removeEntities(this.signEntity)
            if (this.currentStep === 1) {
                this.removeStage();
                for (let i = 0; i < this.previousEntities.length; i++) {
                    window.viewer.entities.remove(this.previousEntities[i]);
                }
                //删除最后时刻产生的实体
                deleteWaterEntity(this.waterEntity)
                deleteWaterEntity(this.ymEndData)
                removeEntities(this.ymAreaData)
                this.ybfxDisplay = false
            } else if (this.currentStep === 2) {
                this.kbDisplay = false;
                deleteWaterEntity(this.waterEntity)
                deleteWaterEntity(this.ymEndData)
                removeEntities(this.ybHeight)
                removeEntities(this.ymAreaData)
            } else if (this.currentStep === 3) {
                this.$bus.$emit("runStop", true);
                removeEntities(this.ybHeight)
                deleteWaterEntity(this.ymEndData)
            } else if (this.currentStep === 4) {
                //删除最后时刻产生的实体
                this.zhpgDisplay = false;
                deleteWaterEntity(this.waterEntity)
                removeEntities(this.ybHeight)
                removeEntities(this.ymAreaData)
            }
        },
        //向后端发送请求，接受各淹没方案描述信息
        getResYMMessage(param) {
            getYmfaEnd(param).then(res => {
                //默认将第一组值作为淹没效果展示
                //第一组为开始时间，第二组为时间步长，第三组为结束时间
                this.ymData = res.data.map(item => {
                    return [
                        [item.name,
                        item.startTime,
                        item.skid],
                        Number(item.bc),
                        [item.name,
                        item.endTime,
                        item.skid],
                    ];
                });
            })
                .catch(error => {
                    console.log(error);
                });
        },
    }
}
</script>

<style lang="scss" scoped>
.bottom-page {
    position: absolute;
    bottom: 1%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
    height: 8%;
    background: transparent;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

::v-deep .el-step__title {
    margin-top: 13px;
    font-size: 10px;
    margin-left: -10%;
    line-height: 0;
}

::v-deep .el-step__title.is-process {
    color: rgb(7, 209, 24);
}

::v-deep .el-step__title.is-wait {
    color: white;
}

::v-deep .el-step__line {
    background-color: rgb(0, 193, 251);
}

::v-deep .el-step__head.is-process {
    color: rgb(7, 209, 24);
    border-color: rgba(33, 123, 88);
}

::v-deep .el-step__head.is-process>.el-step__icon {
    background: rgb(7, 209, 24);
    color: #fff;
}

::v-deep .el-step__head.is-success {
    color: rgb(0, 193, 251);
}

::v-deep .el-step__title.is-success {
    color: white;
}

// ::v-deep .el-icon-user {
//     /*静态图标地址*/
//     background: url('../../assets/image/marker/预报分析1.png') center center no-repeat;
//     background-size: 30px;
// }

// ::v-deep .el-icon-user:before {
//     content: "代替";
//     visibility: hidden;
// }
</style>
  