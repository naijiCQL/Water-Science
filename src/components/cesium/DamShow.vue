<!--
 * @Author: 陈巧龙
 * @Date: 2023-09-04 14:47:41
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-20 09:01:05
 * @FilePath: \ys.skxlsyb\src\components\cesium\DamShow.vue
 * @Description: 溃坝分析结果展示
-->

<template>
    <!-- 创建溃坝分析界面 -->
    <div class="kb-page" v-if="showKbPage">
        <!-- 添加关闭控件 -->
        <img style="cursor: pointer;" @click="closeKbPage" src="../../assets/image/marker/关闭.png" />
        <div class="header-page">
            <el-select class="ds-select" v-model="value1" placeholder="" @change="handleChangeValue1"
                style="width: calc(100% - 180px)" :popper-append-to-body="false">
                <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </div>
        <div style="display: flex; justify-content: center;align-items: center;height: calc(100% - 60px)">
            <div id="main5" class="chart1">
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    name: "DamShow",
    data() {
        return {
            //默认显示窗口
            showKbPage: true,
            //初始化选择框数据
            options1: [{
                value: 5,
                label: '5分钟'
            }, {
                value: 10,
                label: '10分钟'
            }, {
                value: 30,
                label: '30分钟'
            },
            {
                value: 60,
                label: '60分钟'
            }],
            value1: null,
            //初始化表格
            myCharts01: null,
            //保存处理前的时间数据
            timeWithoutYear: [],
            //保存处理前的流量数据
            jhData: [],
            //保存处理后的时间数据
            newTimeData: [],
            //保存处理后的流量数据
            newFloodData: [],
        }
    },
    mounted() {
        //先初始化echarts图表
        this.initEcharts();
        //监听echarts窗口变化
        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler();
        //根据数据是否有数据进行绘制表格
        if (this.$store.state.kbData.kbfx.length !== 0) {
            this.dealData()
            this.drawEcharts01()
        } else {
            this.initEcharts()
        }
    },
    beforeDestroy() {
        // 移除窗口大小改变事件的监听
        window.removeEventListener('resize', this.resizeHandler);
        this.myCharts01.dispose();
    },
    methods: {
        /* eslint-disable */
        //关闭窗口
        closeKbPage() {
            this.showKbPage = false
            this.$bus.$emit("closePage", this.showKbPage);
        },
        //得到每次单选框所选择的值
        handleChangeValue1() {
            this.getNewData(this.value1)
            this.drawEcharts01()
        },
        //对数组重新按照每隔间隔进行赋值 
        getNewData(timeStep) {
            //使用之前先对数组进行清空
            this.newTimeData = []
            this.newFloodData = []
            /* 分别按照时间间隔进行选值 */
            //按照时间间隔对时间进行选值
            for (var i = 0; i < this.timeWithoutYear.length; i += timeStep) {
                this.newTimeData.push(this.timeWithoutYear[i]);
            }
            //按照时间间隔对流量进行选值
            for (var j = 0; j < this.jhData.length; j += timeStep) {
                this.newFloodData.push(this.jhData[j]);
            }
        },
        //对绘制表格的数据进行处理
        dealData() {
            const floodData = this.$store.state.kbData.kbfx

            //对时间和溢流量数据进行赋值
            this.jhData = floodData.map(d => Number(d[1]))
            this.timeWithoutYear = floodData.map(d => d[0]).map(d => d.split(' ')[1])

            //根据不同场景进行选值
            if (this.jhData.length > 6 * 60) {
                this.value1 = 60
            } else if (this.jhData.length > 6 * 30) {
                this.value1 = 30
            } else if (this.jhData.length > 6 * 10) {
                this.value1 = 10
            } else {
                this.value1 = 5
            }
            this.getNewData(this.value1)
        },
        //绘制校核-设计洪水关系图
        drawEcharts01() {
            this.myCharts01 = echarts.init(document.getElementById('main5'))

            const floodData = this.$store.state.kbData.kbfx

            const timeData = floodData.map(d => d[0])
            this.jhData = floodData.map(d => Number(d[1]))
            const maxJhData = Math.max(...(this.jhData)) + 8
            const minJhData = Math.min(...(this.jhData))

            let jhDataInterval = (maxJhData - minJhData) / 5;

            //提取开始时间和结束时间作为标题
            const startDate = timeData[0].split(' ')[0];
            const endDate = timeData[timeData.length - 1].split(' ')[0];
            const title = `${startDate} ~ ${endDate}`;

            var optionData1 = {
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        },
                        label: {       //坐标轴指示器的文本标签
                            show: false
                        }
                    },
                    backgroundColor: 'rgb(17,99,111, 0.8)', // 设置背景颜色为白色
                    borderWidth: 2, // 设置边框宽度为1像素
                    borderColor: 'transparent',
                    extraCssText: 'border-top: 1px solid rgb(96,243,245); border-bottom: 1px solid rgb(96,243,245);border-radius: 0;', // 设置上下边框样式
                    textStyle: {
                        color: "white", // 文字的颜色
                    }
                },
                title: {
                    text: title,
                    left: 'center',
                    textStyle: {
                        color: 'rgb(165,200,231)',
                        fontSize: 10,
                    },
                },
                grid: {
                    left: '15%',
                    bottom: '10%',
                    top: '20%',
                    right: '8%'
                },
                legend: [
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'white'//字体颜色
                        },
                        top: "9%",
                        data: [{ name: `超标准洪水溢流过程线`, icon: '', },],
                        itemWidth: 10,
                        itemHeight: 1,
                        right: 'center'
                    },

                ],
                dataZoom: [{
                    endValue: 5,
                    type: 'inside', // 设置为滑动式
                    start: 0, // 默认显示的起始位置为0
                    xAxisIndex: [0], // 表示控制第一个x轴
                    zoomOnMouseWheel: false,  //滚轮是否触发缩放
                    moveOnMouseMove: true,  //鼠标滚轮触发滚动
                    moveOnMouseWheel: true
                }],
                xAxis: [
                    {
                        type: 'category',
                        data: this.newTimeData,
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,//代表显示所有x轴标签显示
                            show: true,
                            textStyle: {
                                color: 'white'
                            }

                        },
                        axisLine: {       //坐标轴轴线
                            lineStyle: {           //坐标轴轴线颜色
                                color: 'rgb(20,203,248)'
                            }
                        },
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: minJhData,
                        max: maxJhData,
                        splitNumber: 5,
                        interval: jhDataInterval,
                        boundaryGap: false, // 不留白，从原点开始
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: 'white'
                            },
                            formatter(value) {
                                // 保留两位小数
                                return value.toFixed(1);
                            },
                        },
                        axisLine: {  //坐标轴轴线
                            show: true,
                            lineStyle: {           //坐标轴轴线颜色
                                color: 'rgb(20,203,248)'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed',//虚线
                                color: 'rgb(64,91,95)'
                            },
                            show: true //隐藏
                        },
                    }
                ],
                series: [
                    {
                        name: `超标准洪水溢流过程线`,
                        type: 'line',
                        smooth: true,
                        symbol: 'none', // 不显示圆点
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.newFloodData,
                        lineStyle: {
                            type: 'dashed', // 虚线样式
                            width: 2, // 线宽
                            color: 'yellow'
                        },

                    },

                ]
            };
            this.myCharts01.setOption(optionData1)
        },
        //初始化图表
        initEcharts() {
            this.myCharts01 = echarts.init(document.getElementById('main5'))
            var optionData1 = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        },
                        label: {       //坐标轴指示器的文本标签
                            show: false
                        }
                    }
                },
                grid: {
                    left: '12%',
                    bottom: '10%',
                    top: '15%',
                    right: '5%'
                },
                xAxis: [
                    {
                        type: 'category',
                        data: [40, 45, 50, 55, 60, 65, 70, 75],
                        boundaryGap: false, // 不留白，从原点开始
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,//代表显示所有x轴标签显示
                            show: true,
                            textStyle: {
                                color: 'white'
                            }

                        },
                        axisLine: {       //坐标轴轴线
                            lineStyle: {           //坐标轴轴线颜色
                                color: 'rgb(20,203,248)'
                            }
                        },
                        axisTick: {
                            show: false // 取消 x 轴刻度线显示
                        },
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: 120,
                        max: 0,
                        interval: 20,
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: 'white'
                            },
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed',//虚线
                                color: 'rgb(64,91,95)'
                            },
                            show: true //隐藏
                        }
                    },
                ],
            };
            this.myCharts01.setOption(optionData1)
        },
        // 在窗口大小改变时重新绘制图表
        resizeHandler() {
            this.myCharts01.resize();
        },
    }

}
</script>

<style lang="scss" scoped>
.kb-page {
    width: 25%;
    height: 35%;
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: url(../../assets/image/marker/弹窗框.png);
    background-size: 100% 100%;
    color: white;
}

.kb-page img {
    position: absolute;
    right: 5%;
    margin-top: 5%;
}

.header-page {
    height: 50px;
    display: flex;
    align-items: flex-end;
    font-size: 15px;
    margin-left: 5%;
    margin-right: 5%;
    border-bottom: 1px solid rgb(4, 81, 115);
    /* 添加底部边框样式 */
}

button {
    background: url(../../assets/image/marker/Tab切换未选.png);
    background-size: 100% 100%;
    border: 0;
    width: 25%;
    height: 35px;
    color: white;
}

button:hover,
button:active {
    background: url(../../assets/image/marker/Tab切换选.png);
    background-size: 100% 100%;
    border: 0;
    width: 25%;
    height: 35px;
    color: white;
}

.chart1 {
    height: 100%;
    width: 100%;
}

.ds-select {

    ::v-deep input::-webkit-input-placeholder {
        color: white;
    }

    ::v-deep input::-moz-input-placeholder {
        color: white;
    }

    ::v-deep input::-ms-input-placeholder {
        color: white;
    }

    //修改主框的样式
    ::v-deep .el-select,
    ::v-deep .el-input,
    ::v-deep .el-input__inner {
        background-color: rgb(21, 45, 57, 0.4);
        color: white;
        border-color: rgb(26, 159, 239);
        border-radius: 3px;
        height: 25px;
        font-size: 10px;
    }

    ::v-deep .el-input__inner {
        padding: 8px;
    }

    // ::v-deep .el-select__tags {
    //     display: none;
    // }
    ::v-deep .el-tag.el-tag--info {
        color: black;
    }

    ::v-deep.el-select-dropdown.is-multiple,
    ::v-deep .el-select-dropdown__item.selected.hover {
        background-color: transparent;
    }

    ::v-deep.el-select-dropdown.is-multiple,
    ::v-deep .el-select-dropdown__item.selected {
        background-color: transparent;
    }

    //修改的是el-input上下的小图标
    ::v-deep .el-input__suffix {
        top: 25%;
    }

    ::v-deep .el-input__icon {
        line-height: inherit;
    }

    ::v-deep .el-input__suffix-inner {
        display: inline-block;
    }

    //修改总体选项的样式 最外层
    ::v-deep .el-select-dropdown,
    ::v-deep .el-popper {
        background: rgba(24, 51, 78, 0.5);
        border: 0.5px solid rgb(26, 159, 239);
        margin-top: 0px;
    }


    //修改单个的选项的样式即修改选择框文字与第一栏对齐方式
    ::v-deep .el-select-dropdown__item {
        background-color: transparent;
        color: #fff;
        height: 25px;
        font-size: 10px;
        line-height: 20px;
        padding-left: 3%
    }

    ::v-deep .el-select-dropdown__list {
        padding: 0;
    }

    //item选项的hover样式
    ::v-deep .el-select-dropdown__item.hover,

    ::v-deep .el-select-dropdown__item:hover {
        color: rgb(3, 211, 230);
        background: rgba(25, 87, 128, 0.3);
    }

    //修改的是下拉框选项内容上方的尖角
    ::v-deep .el-popper .popper__arrow,
    .el-popper .popper__arrow::after {
        display: none;
    }

    ::v-deep .el-select,
    ::v-deep .el-tag {
        margin: 0;
        border: 0.5px solid rgb(20, 203, 248);
    }

    ::v-deep .el-select__tags {
        flex-wrap: nowrap
    }

    ::v-deep .el-tag.el-tag--info {
        background-color: transparent;
        color: #fff;
    }

    ::v-deep .el-select,
    ::v-deep .el-tag__close,
    ::v-deep.el-icon-close {
        background-color: #fff;
    }
}
</style>