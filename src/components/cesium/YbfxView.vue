<!--
 * @Author: 陈巧龙
 * @Date: 2023-09-13 11:18:45
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 10:10:55
 * @FilePath: \ys.skxlsyb\src\components\cesium\YbfxView.vue
 * @Description: 预报分析页面
-->

<template>
    <!-- 创建灾后评估界面 -->
    <div class="ybfx-page" v-if="showYbfxPage">
        <div class="sjfw-page">
            <span>{{ `降雨时间范围：${this.ybjy[3]}` }}</span>
        </div>
        <div class="ybjygc">
            <div style="display: flex;align-items: center;width: 25%;"><img style="margin-left: 3px;"
                    src="../../assets/image/marker/预报降雨.png" />
                <span style="color: rgba(3,195,252,0.9);font-weight: bold;">预报降雨过程</span>
            </div>
            <span style="width: 25%;">{{ `入库总量：${this.ybjy[1]}万m³` }}</span>
            <span style="width: 25%;">{{ `溢流总量：${this.ybjy[2]}万m³` }}</span>
            <span style="width: 25%;">{{ `累计降雨量：${this.ybjy[0]}mm` }}</span>
        </div>
        <div class="ybjygc">
            <div style="display: flex;align-items: center;width: 25%;"><img style="margin-left: 3px;"
                    src="../../assets/image/marker/设计洪水.png" />
                <span style="color: rgba(3,195,252,0.9);font-weight: bold;">设计洪水过程</span>
            </div>
            <span style="width: 25%;">{{ `入库总量：${this.sjjh.total_SjhsLsl}万m³` }}</span>
            <span style="width: 25%;">{{ `溢流总量：${this.sjjh.SjhsYl}万m³` }}</span>
            <span style="width: 25%;">{{ `纳雨量：${this.sjjh.SjhsNyl}mm` }}</span>
        </div>
        <div class="ybjygc">
            <div style="display: flex;align-items: center;width: 25%;"><img style="margin-left: 3px;"
                    src="../../assets/image/marker/校核洪水.png" />
                <span style="color: rgba(3,195,252,0.9);font-weight: bold;">校核洪水过程</span>
            </div>
            <span style="width: 25%;">{{ `入库总量：${this.sjjh.total_XhhsLsl}万m³` }}</span>
            <span style="width: 25%;">{{ `溢流总量：${this.sjjh.XhhsYl}万m³` }}</span>
            <span style="width: 25%;">{{ `纳雨量：${this.sjjh.XhhsNyl}mm` }}</span>
        </div>
        <div class="ybjygc">
            <div style="display: flex;align-items: center;width: 25%;"><img style="margin-left: 3px;"
                    src="../../assets/image/marker/溃坝洪水.png" />
                <span style="color: rgba(3,195,252,0.9);font-weight: bold;">溃坝洪水过程</span>
            </div>
            <span style="width: 25%;">{{ `入库总量：${this.kbhs.Lsltotal}万m³` }}</span>
            <span style="width: 25%;">{{ `溢流总量：${this.kbhs.VolFlowOut}万m³` }}</span>
            <span style="width: 25%;">{{ `溃坝时长：${this.kbhs.SimuTime}小时` }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "YbfxView",
    data() {
        return {
            //初始化页面显示
            showYbfxPage: true,
            //预报降雨过程
            ybjy: [],
            //设计校核过程
            sjjh: {
                "total_SjhsLsl": 0,
                "SjhsNyl": 0,
                "total_XhhsLsl": 0,
                "XhhsYl": 0,
                "SjhsYl": 0,
                "XhhsNyl": 0
            },
            //溃坝过程
            kbhs: {
                "SimuTime": 0,
                "VolFlowOut": 0,
                "Lsltotal": 0
            }
        }
    },
    created() {
        //保存三个过程数据
        this.sjjh = this.$store.state.sjjhData
        this.kbhs = this.$store.state.kbData

        if (this.$store.state.ybData.length === 0) {
            this.ybjy = [0, 0, 0, '']
        } else {
            this.ybjy = this.$store.state.ybData
        }

    },
    mounted() {
    },

    methods: {
    }
}
</script>

<style lang="scss" scoped>
.ybfx-page {
    width: 43%;
    height: 30%;
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: url(../../assets/image/marker/背景框.png);
    background-size: 100% 100%;
    color: white;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.sjfw-page {
    margin-top: 4%;
    height: 15%;
    width: 92%;
    background: url(../../assets/image/marker/降雨时间范围框.png);
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 14px;
}

.ybjygc {
    height: 26%;
    width: 92%;
    background: url(../../assets/image/marker/过程框.png);
    background-size: 100% 100%;
    margin-bottom: -4%;
    display: flex;
    align-items: center;
    font-size: 12px;
}
</style>