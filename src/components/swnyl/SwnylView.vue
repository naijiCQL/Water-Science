<!--
 * @Author: 陈巧龙
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-03 14:15:35
 * @FilePath: \ys.skxlsyb\src\components\swnyl\SwnylView.vue
 * @Description: 水位纳雨量页面
-->
<template>
    <!-- 创建水位纳雨量界面 -->
    <div v-if="swnylPageVisible" class="swnyl-page">
        <!-- 添加关闭控件 -->
        <img style="cursor: pointer;" @click="closeSwnylPage" src="../../assets/image/marker/关闭.png" />
        <div class="header-page">
            <button @click="drawEcharts01">纳雨量</button>
            <button @click="drawZlybEcharts">涨率预报</button>
        </div>
        <div style="display: flex; justify-content: center;align-items: center;height: calc(100% - 60px)">
            <div id="main4" class="chart1">
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    name: "SwlylView",
    data() {
        return {
            swnylPageVisible: true,
            swnylData: [],
            myCharts01: null,
            myCharts02: null,
        }
    },
    mounted() {
        //先初始化echarts图表
        this.initEcharts();

        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler();

        //采用this.$bus.$on接受其他组件传送的数据，“showNYLData”为自定义名字，与发送数据名称一样，“value”即为其他组件发送的数据
        this.$bus.$on("showNYLData", (value) => {
            //使用之前先清空数组的数据
            this.swnylData = [],

                //将另一个组件的数据赋值给swnylData数组
                this.swnylData = value;

            //绘制echarts图表,如果有数据则进行绘图，如果没有数据，则初始化表格
            if (this.swnylData.length !== 0) {
                this.drawEcharts01()
            } else {
                this.initEcharts()
            }
        });

        //将新接受的水库当前水位绘制在图上
        this.$bus.$on("showCurrentData", (value) => {
            //将当前水位添加进数组
            //this.swnylData = value.concat(this.swnylData)
            this.swnylData = this.swnylData.concat(value)

            this.drawEcharts01()
        });

    },

    beforeDestroy() {
        // 移除窗口大小改变事件的监听
        window.removeEventListener('resize', this.resizeHandler);
        this.myCharts01.dispose();
        this.myCharts02.dispose();
    },

    methods: {
        //关闭窗口
        closeSwnylPage() {
            this.swnylPageVisible = false
            this.$bus.$emit("closeNYLPage", this.swnylPageVisible);
        },
        //绘制水位与纳雨量关系图
        drawEcharts01() {
            //清除表二的样式
            if (this.myCharts02) {
                this.myCharts02.clear();
            }
            this.myCharts01 = echarts.init(document.getElementById('main4'))

            const xData = this.swnylData.map(item => item[0]);
            const yData = this.swnylData.map(item => item[1]);

            const xTickMin = Math.floor(Math.min(...xData));
            const xTickMax = Math.ceil(Math.max(...xData));
            const yTickMax = Math.ceil(Math.max(...yData));

            // 保存两个点值，用于绘制当前水位
            var twoDimensionalArray = [];

            var data1 = [xData[6], 0];
            var data2 = [xData[6], yTickMax];

            twoDimensionalArray.push(data1, data2);

            var optionData1 = {
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgb(17,99,111, 0.8)', // 设置背景颜色为白色
                    borderWidth: 2, // 设置边框宽度为1像素
                    borderColor: 'transparent',
                    extraCssText: 'border-top: 1px solid rgb(96,243,245); border-bottom: 1px solid rgb(96,243,245);border-radius: 0;', // 设置上下边框样式
                    textStyle: {
                        color: "white", // 文字的颜色
                    },
                    formatter: function (params) {
                        var data = params.data.coord
                        return `当前水位：${data[0]} m<br>当前纳雨量：${yData[0].toFixed(2)} 万m³`
                    }
                },
                grid: {
                    left: '15%',
                    bottom: '10%',
                    top: '20%',
                    right: '5%'
                },
                legend: [
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "1%",
                        data: ['汛限水位'],
                        itemWidth: 10,
                        itemHeight: 1,
                        left: '20%'
                    },
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "1%",
                        data: ['设计水位'],
                        itemWidth: 10,
                        itemHeight: 1,
                        right: '35%'
                    },
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "1%",
                        data: ['校核水位'],
                        itemWidth: 10,
                        itemHeight: 1,
                        right: '10%'
                    },
                ],
                xAxis: [
                    {
                        type: 'value',
                        min: xTickMin,
                        max: xTickMax,
                        splitNumber: 8,
                        axisLabel: {
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
                        splitLine: {
                            show: false
                        },
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: 0,
                        max: yTickMax,
                        splitNumber: 5,
                        interval: yTickMax / 5,
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
                        axisTick: {
                            show: false // 取消 x 轴刻度线显示
                        },
                    }
                ],
                series: [
                    {
                        name: '汛限水位',
                        data: this.swnylData.slice(0, 2),
                        type: 'line',
                        smooth: true,
                        symbol: 'none', // 不显示圆点
                        lineStyle: {
                            width: 2, // 线宽
                            color: 'yellow'
                        },
                    },
                    {
                        data: this.swnylData.slice(0, 2),
                        type: 'scatter',
                        symbolSize: 6,
                        itemStyle: {
                            color: 'yellow',
                        },
                        tooltip: {
                            confine: true,
                            formatter: function (params) {
                                var marker = params.marker.toString();
                                var data = params.data
                                return `${marker} 汛限水位：${data[0]} m<br>${marker} 纳雨量：${data[1]} 万m³`
                            }
                        },
                    },
                    {
                        name: '设计水位',
                        data: this.swnylData.slice(2, 4),
                        type: 'line',
                        smooth: true,
                        symbol: 'none', // 不显示圆点
                        lineStyle: {
                            width: 2, // 线宽
                            color: 'rgb(0,215,175)'
                        },
                    },
                    {

                        data: this.swnylData.slice(2, 4),
                        type: 'scatter',
                        symbolSize: 6,
                        itemStyle: {
                            color: 'rgb(0,215,175)',
                        },
                        tooltip: {
                            formatter: function (params) {
                                var marker = params.marker.toString();
                                var data = params.data
                                return `${marker} 设计水位：${data[0]} m<br>${marker} 纳雨量：${data[1].toFixed(2)} 万m³`
                            }
                        },

                    },
                    {
                        name: '校核水位',
                        data: this.swnylData.slice(4, 6),
                        type: 'line',
                        smooth: true,
                        symbol: 'none', // 不显示圆点
                        lineStyle: {
                            width: 2, // 线宽
                            color: 'rgb(50,204,253)'
                        },
                    },
                    {
                        data: this.swnylData.slice(4, 6),
                        type: 'scatter',
                        symbolSize: 6,
                        itemStyle: {
                            color: 'rgb(50,204,253)',
                        },
                        tooltip: {
                            formatter: function (params) {
                                var marker = params.marker.toString();
                                var data = params.data
                                return `${marker} 校核水位：${data[0]} m<br>${marker} 纳雨量：${data[1].toFixed(2)} 万m³`
                            }
                        },
                    },
                    {
                        name: '当前水位',
                        data: twoDimensionalArray,
                        type: 'line',
                        smooth: true,
                        symbol: 'none', // 不显示圆点
                        lineStyle: {
                            width: 2, // 线宽
                            color: 'rgb(50,204,253)'
                        },
                    },
                    {
                        name: '当前水位',
                        type: 'line',
                        markLine: {
                            symbol: ['none', 'diamond'],
                            label: {
                                show: true,
                                color: 'white',
                                fontSize: 12,
                                formatter() {
                                    return `当前水位:${xData[6]}m`
                                },
                                fontWeight: 450,
                                fontFamily: 'HYQiHeiX1-GEW',
                            },
                            data: [[
                                { coord: [xData[6], Math.min(...yData)] },
                                { coord: [xData[6], Math.max(...yData)] }
                            ]],
                            lineStyle: {
                                type: 'solid', // 虚线样式
                                width: 1, // 线宽
                                color: 'rgba(144,218,253,0.6)'
                            },
                        },
                    }
                ],
            };
            this.myCharts01.setOption(optionData1)
        },

        //根据方程和系数求解y值
        calLine01(x) {
            const e = Math.E;
            return 131.8 * Math.pow(e, 0.002 * x);
        },

        calLine02(x) {
            return 0.01 * (x - 4) * (x - 4) + 133.5;
        },

        // 绘制涨率预报过程线
        drawZlybEcharts() {
            // 清除第一个图表的内容
            this.myCharts01.clear();
            this.myCharts02 = echarts.init(document.getElementById('main4'))

            // 计算曲线上的点的坐标
            const curveData = [];
            const step = 28 / 100; // 曲线的采样步长
            for (let x = 4; x <= 28; x += step) {
                const y = this.calLine01(x); // 计算对应的 y 值
                curveData.push([x, y]);
            }

            const curveData2 = [];
            const step2 = 28 / 100; // 曲线的采样步长
            for (let x = 4; x <= 20; x += step2) {
                const y = this.calLine02(x); // 计算对应的 y 值
                curveData2.push([x, y]);
            }

            var optionData2 = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        },
                    },
                    backgroundColor: 'rgb(17,99,111, 0.8)', // 设置背景颜色为白色
                    borderWidth: 2, // 设置边框宽度为1像素
                    borderColor: 'transparent',
                    extraCssText: 'border-top: 1px solid rgb(96,243,245); border-bottom: 1px solid rgb(96,243,245);border-radius: 0;', // 设置上下边框样式
                    textStyle: {
                        color: "white", // 文字的颜色
                    }
                },
                legend: [
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "1%",
                        data: ['趋势线'],
                        itemWidth: 10,
                        itemHeight: 1,
                        left: '30%'
                    },
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "1%",
                        data: ['水位涨率关系线'],
                        itemWidth: 10,
                        itemHeight: 1,
                        right: '20%'
                    },
                ],
                grid: {
                    left: '12%',
                    bottom: '10%',
                    top: '20%',
                    right: '17%'
                },
                xAxis: [
                    {
                        type: 'value',
                        name: '时间/h',
                        min: 0,
                        max: 28,
                        splitNumber: 6,
                        axisLabel: {
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
                        splitLine: {
                            show: false
                        },
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '水位/m',
                        min: 132,
                        max: 140,
                        interval: 1,
                        boundaryGap: false, // 不留白，从原点开始
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: 'white'
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
                        axisTick: {
                            show: false // 取消 x 轴刻度线显示
                        },
                    },
                ],
                series: [
                    {
                        name: '趋势线',
                        data: curveData,
                        type: 'line',
                        symbol: 'none',
                        lineStyle: {
                            color: 'rgb(63,234,244,0.8)',
                        },
                        tooltip: {
                            valueFormatter: function (value) {
                                return value.toFixed(2);
                            }
                        },
                    },
                    {
                        name: '水位涨率关系线',
                        data: curveData2,
                        type: 'line',
                        symbolSize: 2,
                        lineStyle: {
                            color: 'yellow', // 设置曲线的颜色
                        },
                        tooltip: {
                            valueFormatter: function (value) {
                                return value.toFixed(2);
                            }
                        },
                    }
                ],
            };
            this.myCharts02.setOption(optionData2)
        },
        //初始化图表
        initEcharts() {
            this.myCharts01 = echarts.init(document.getElementById('main4'))
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
                    top: '20%',
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
.swnyl-page {
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

.swnyl-page img {
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
</style>