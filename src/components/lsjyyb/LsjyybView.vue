<!--
 * @Author: 杨道博
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-25 10:13:57
 * @FilePath: \ys.skxlsyb\src\components\lsjyyb\LsjyybView.vue
 * @Description: 历史经验预报
-->
<template>
    <div>
        <!-- 历史经验主页面 -->
        <el-container v-if="lsjyybPageVisible" class="lsjyyb-page">
            <div class="sq-button" @click="closeLsjyybPage">
                <img src="../../assets/image/marker/收起.png" />
            </div>
            <!-- 上页面布局 -->
            <el-header height="25px">
                <!-- 添加页面标题 -->
                <span class="header-text">历史经验预报</span>
            </el-header>
            <!-- 下页面布局 -->
            <el-main>
                <div style="display: flex;align-items: center;">
                    <img src="../../assets/image/marker/降水信息.png" />
                    <span style="font-size: 14px;font-weight: bold;">降雨信息</span>
                    <span style="margin-left: calc(100% - 170px);">单位：mm</span>
                </div>
                <img style="width: 35%;margin-left: 3%;" src="../../assets/image/marker/二级标题条.png" />
                <div style="display: flex; justify-content: center;align-items: center;height: calc(50% - 47px);">
                    <div id="main2" class="chart1">
                    </div>
                </div>
                <div style="display: flex;align-items: center;">
                    <img src="../../assets/image/marker/水位信息.png" />
                    <span style="font-size: 14px;font-weight: bold;">水位信息</span>
                    <span style="margin-left: calc(100% - 170px);">单位：m</span>
                </div>
                <img style="width: 35%;margin-left: 3%;" src="../../assets/image/marker/二级标题条.png" />
                <div style="display: flex; justify-content: center;align-items: center;height: calc(50% - 47px);">
                    <div id="main3" class="chart2">
                    </div>
                </div>
            </el-main>
        </el-container>
        <div v-if="dkButtonVisible" class="dk-button" @click="opneLsjyybPage">
            <img src="../../assets/image/marker/展开.png" />
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    name: "LsjyybView",
    data() {
        return {
            //初始页面加载显示
            lsjyybPageVisible: true,
            //初始打开页面按钮不显示
            dkButtonVisible: false,
            myCharts01: null,
            myCharts02: null,
            //定义一个数组来接受时间-实时降雨-实时水位的数据
            rainfalLevel: [],
            //用来储存接受来的时间信息
            timeArray: [],
            //用来储存实时降雨信息
            rainArray: [],
            //用来储存实时水位数据
            waterLevelArray: [],
            //保存各状态水位值
            designWaterLevel: [],
            //堰顶高程
            ydHeight: null,
        }
    },
    mounted() {
        //页面加载时初始化图标
        this.initChart();
        //监听窗口大小变化，触发图表的自适应
        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler();

        //接受来自headerView组件传来的时间、降雨、水位数据。
        this.$bus.$on("initRLData", (value) => {
            if (value) {
                //传值之前先清空数组，避免数组还遗留上组数据
                this.rainfalLevel = [],

                    //将预报设置组件得到的实时降雨、实时水位保存进新创立的数组里面
                    this.rainfalLevel = value

                //将二维数组数据拆分成三个一维数组
                this.timeArray = this.rainfalLevel.map(item => item[0]);
                this.rainArray = this.rainfalLevel.map(item => item[1]);
                this.waterLevelArray = this.rainfalLevel.map(item => item[2]);
                this.drawChart()
            } else {
                this.initChart();
            }
            //计算预报分析数据
            this.getYbfxData(value)
        });

        //接受来自ybszView组件传来的时间、降雨、水位数据。
        this.$bus.$on("newRLData", (value) => {
            if (value) {
                //传值之前先清空数组，避免数组还遗留上组数据
                this.rainfalLevel = [],

                    //将预报设置组件得到的实时降雨、实时水位保存进新创立的数组里面
                    this.rainfalLevel = value

                //将二维数组数据拆分成三个一维数组
                this.timeArray = this.rainfalLevel.map(item => item[0]);
                this.rainArray = this.rainfalLevel.map(item => item[1]);
                this.waterLevelArray = this.rainfalLevel.map(item => item[2]);
                this.drawChart()
            } else {
                this.initChart();
            }

            //计算预报分析数据
            this.getYbfxData(value)
        });

        //保存各水位值
        this.$bus.$on("fn", (value) => {
            this.designWaterLevel = []
            this.designWaterLevel = value.map(item => item[0]);
        });

        //控制页面是否关闭
        this.$bus.$on("closeLsjyyb", (value) => {
            this.lsjyybPageVisible = value
            this.dkButtonVisible = !value

            if (value) {
                setTimeout(() => {
                    if (this.rainfalLevel.length !== 0) {
                        this.drawChart()
                    } else {
                        this.initChart()
                    }
                }, 100);
            }
        });
    },
    methods: {
        //查找数组中符合条件的值
        findFirstGreater(array, value) {
            for (let i = 0; i < array.length; i++) {
                if (array[i] > value) {
                    return i;
                }
            }
            return -1;
        },
        //计算日期范围
        formatTimeRange(timeArray) {
            const startDate = new Date(timeArray[0]);
            const endDate = new Date(timeArray[timeArray.length - 1]);

            const formattedStartDate = this.formatDate(startDate);
            const formattedEndDate = this.formatDate(endDate);

            return `${formattedStartDate}-${formattedEndDate}`;
        },
        //格式化日期
        formatDate(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();

            return `${year}年${month}月${day}日${hours}:00`;
        },
        //得到预报分析数据
        getYbfxData(param) {
            /* 求解预报分析过程数据 */
            const data = param.slice(2)
            /* 求总的降雨量 */
            const rainfall = data.map(item => item[1]);
            //累计降雨量
            const rfSum = rainfall.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            /* 根据水位判断是否超过堰顶 */
            const waterLevel = data.map(item => item[2]);
            const index = this.findFirstGreater(waterLevel, this.$store.state.ydHeight);
            /* 根据来水量求得溢洪量 */
            const inflow = data.map(item => item[3]);

            //入库总量
            const ifSum = inflow.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const subArray = inflow.slice(index);
            //溢流总量
            const ylSum = subArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            /* 时间范围 */
            const timeRange = data.map(item => item[4]);
            //获得时间范围
            const formattedTimeRange = this.formatTimeRange(timeRange);

            //将预报降雨过程数据发送进行绘制[累计降雨量,入库总量,溢流总量,时间范围]
            const ybfxData = [rfSum.toFixed(2), ifSum.toFixed(2), ylSum.toFixed(2), formattedTimeRange]
            //将堰顶高程数据进行储存
            this.$store.commit('updateYbData', ybfxData)
        },
        //绘制表格
        drawChart() {
            this.myCharts01.hideLoading();
            this.myCharts02.hideLoading();

            this.myCharts01 = echarts.init(document.getElementById('main2'))
            this.myCharts02 = echarts.init(document.getElementById('main3'))

            //得到降每场次降雨的最大最小值，并进行取舍，用于设置y轴的间距
            let maxRainfall = Math.ceil(Math.max(...this.rainArray)) + 3
            let minRainfall = Math.floor(Math.min(...this.rainArray))

            //当没有降雨量的时候，为了作图美观
            if (maxRainfall === 0) {
                maxRainfall += 0.5
            }

            //得到降每场次水位的最大最小值，并进行取舍，用于设置y轴的间距
            const maxWaterLevel = Math.ceil(Math.max(...this.designWaterLevel))
            const minWaterLevel = Math.min(...this.designWaterLevel)

            //将两条纵坐标分为五等分
            let rainfallInterval = (maxRainfall - minRainfall) / 5;
            let WaterLevelInterval = 3

            //遍历降雨数组，并且数组每个值加上0.3
            let seriesData = this.rainArray.map(value => {
                return (value + rainfallInterval / 5)
            });

            //获取当前时间
            var currentTime = new Date();
            var hours = currentTime.getHours();
            var formattedMinutes = "00";
            var formattedHours = (hours < 10 ? "0" : "") + hours;
            var formattedTime = formattedHours + ":" + formattedMinutes;

            //获得当前时间的索引，避免绘制到其他同名时间点上去
            var firstIndex = this.timeArray.indexOf(formattedTime);

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
                grid: {
                    top: '15%',
                    bottom: '10%', // 调整 grid 的底部间距，给 x 轴名称留出空间
                    left: '15%',
                    right: '7%'
                },
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
                        data: this.timeArray,
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,//代表显示所有x轴标签显示
                            show: true,
                            textStyle: {
                                color: 'white'
                            },
                            formatter(value) {
                                // 保留两位小数
                                return value.substring(0, 5);
                            },
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
                        min: minRainfall,
                        max: maxRainfall,
                        splitNumber: 5,
                        interval: rainfallInterval,
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
                series: [
                    {
                        type: 'bar',
                        barWidth: 15, // 设置柱状图的宽度
                        tooltip: {
                            valueFormatter: function (value) {
                                return '降雨：' + (value - rainfallInterval / 5).toFixed(2) + ' mm';
                            }
                        },
                        data: seriesData,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgb(44,207,253)' },
                                { offset: 1, color: 'rgb(42,254,244)' }
                            ]),
                        },
                        textStyle: {
                            fontSize: 12,
                            fontWeight: 'bolder',
                            color: 'white'
                        },
                        label: {
                            normal: {
                                show: true,//开启显示
                                position: 'top',//柱形上方
                                textStyle: { //数值样式
                                    color: 'rgb(62,196,227)'
                                },
                                formatter: function (params) {
                                    return Number((params.value - rainfallInterval / 5).toFixed(2));
                                },
                            }
                        }

                    },
                    {
                        name: '当前时间',
                        type: 'line',
                        markLine: {
                            symbol: ['none', 'diamond'],
                            label: {
                                show: true,
                                padding: [0, 0, 9, 0],
                                color: 'rgb(165,200,231)',//字体颜色
                                formatter: '当前时间',
                                height: 10,
                                fontWeight: 550,
                                fontFamily: 'HYQiHeiX1-GEW',
                            },
                            data: [
                                { xAxis: firstIndex }
                            ],
                            lineStyle: {
                                type: 'solid', // 虚线样式
                                width: 1, // 线宽
                                color: 'rgb(144,218,253,0.5)'
                            },
                        },
                        tooltip: {
                            formatter: function (value) {
                                return value.toFixed(1);
                            }
                        },
                    }
                ],

            };

            var optionData2 = {
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
                    },
                    //重写样式
                    formatter(params) {
                        var marker = params[0].marker.toString();
                        if (params.length === 1) {
                            return `时间 : ${params[0].name}<br>${marker} 预报水位 : ${params[0].data} m`;
                        } else {
                            return `时间 : ${params[0].name}<br>${marker} 当前水位 : ${params[0].data} m`;
                        }
                    }
                },
                grid: {
                    top: '20%',
                    bottom: '15%',
                    left: '15%',
                    right: '7%'
                },
                //这里需要注意按照series绘制线的顺序，但是第二条线不需要绘制，但是需要在第二项添加''
                color: ['rgb(144,218,253)', '', 'rgb(98,202,253)', 'rgb(0,221,178)', 'rgb(250,197,42)'],
                legend: [
                    {
                        textStyle: {
                            fontSize: 10,//字体大小
                            color: 'rgb(161,193,221)'//字体颜色
                        },
                        top: 'start',
                        data: [{ name: '水位', icon: '' },],
                        itemWidth: 15,
                        itemHeight: 1,
                        left: '27%',
                    },
                    {
                        textStyle: {
                            fontSize: 10,//字体大小
                            color: 'rgb(161,193,221)'//字体颜色
                        },
                        top: 'start',
                        data: [{ name: '校核水位', icon: '' },],
                        itemWidth: 15,
                        itemHeight: 1,
                        right: '24%',
                    },
                    {
                        textStyle: {
                            fontSize: 10,//字体大小
                            color: 'rgb(161,193,221)'//字体颜色
                        },
                        top: '6%',
                        left: '27%',
                        data: [{ name: '设计水位', icon: '' },],
                        itemWidth: 15,
                        itemHeight: 1,
                    },
                    {
                        textStyle: {
                            fontSize: 10,//字体大小
                            color: 'rgb(161,193,221)'//字体颜色
                        },
                        top: '6%',
                        right: '24%',
                        data: [{ name: '汛限水位', icon: '' },],
                        itemWidth: 15,
                        itemHeight: 1,
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
                        data: this.timeArray,
                        boundaryGap: false, // 不留白，从原点开始
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,//代表显示所有x轴标签显示
                            show: true,
                            textStyle: {
                                color: 'white'
                            },
                            formatter(value) {
                                // 保留两位小数
                                return value.substring(0, 5);
                            },
                        },
                        axisLine: {       //坐标轴轴线
                            lineStyle: {           //坐标轴轴线颜色
                                color: 'rgb(20,203,248)'
                            }
                        },
                        axisTick: {
                            show: false // 取消 x 轴刻度线显示
                        }

                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: maxWaterLevel - 15,
                        max: maxWaterLevel,
                        splitNumber: 5,
                        interval: WaterLevelInterval,
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: 'white'
                            },
                            formatter(value) {
                                // 保留两位小数
                                if (value === (maxWaterLevel - 15)) {
                                    return minWaterLevel
                                }
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
                        }
                    },
                ],
                series: [
                    {
                        name: '水位',
                        type: 'line',
                        symbol: 'none', // 不显示圆点
                        smooth: true,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgb(144,218,253)' },
                                { offset: 1, color: 'rgb(20,45,50)' }
                            ]),
                            opacity: 0.6
                        },
                        data: this.waterLevelArray.slice(0, firstIndex + 1),
                        lineStyle: {
                            type: 'solid', // 虚线样式
                            width: 2, // 线宽
                            color: 'rgb(144,218,253)'
                        },

                    },
                    {
                        name: '预报水位',
                        type: 'line',
                        symbol: 'none', // 不显示圆点
                        smooth: true,
                        data: this.waterLevelArray,
                        lineStyle: {
                            type: 'dashed', // 虚线样式
                            width: 2, // 线宽
                            color: 'rgb(144,218,253)'
                        },

                    },
                    {
                        name: '校核水位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            label: {
                                show: true,
                                fontSize: 10, // 设置标签的字体大小
                                padding: [0, 0, 0, 180],
                                position: "middle",
                                color: 'rgb(98,202,253)',
                                formatter: `校核水位 ${this.designWaterLevel[5]}m`,
                                fontWeight: 450,
                                fontFamily: 'HYQiHeiX1-GEW',
                            },
                            data: [
                                {
                                    yAxis: this.designWaterLevel[5],
                                },
                            ],
                            lineStyle: {
                                type: 'dashed', // 虚线样式
                                width: 1, // 线宽
                                color: 'rgb(98,202,253)'
                            },
                        },
                    },
                    {
                        name: '设计水位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            label: {
                                show: true,
                                fontSize: 10,
                                position: "middle",
                                color: 'rgb(0,221,178)',//字体颜色
                                formatter: `设计水位 ${this.designWaterLevel[3]}m`,
                                fontWeight: 450,
                                fontFamily: 'HYQiHeiX1-GEW',
                            },
                            data: [
                                {
                                    yAxis: this.designWaterLevel[3],
                                },
                            ],
                            lineStyle: {
                                type: 'dashed', // 虚线样式
                                width: 1, // 线宽
                                color: 'rgb(0,221,178)'
                            },
                        },
                    },
                    {
                        name: '汛限水位',
                        type: 'line',
                        markLine: {
                            symbol: 'none',
                            label: {
                                show: true,
                                fontSize: 10,
                                position: "middle",
                                color: 'rgb(250,197,42)',//字体颜色
                                padding: [0, 0, 0, -175],
                                formatter: `汛限水位 ${this.designWaterLevel[2]}m`,
                                fontWeight: 450,
                                fontFamily: 'HYQiHeiX1-GEW',
                            },
                            data: [
                                {
                                    yAxis: this.designWaterLevel[2],
                                },
                            ],
                            lineStyle: {
                                type: 'dashed', // 虚线样式
                                width: 1, // 线宽
                                color: 'rgb(250,197,42)'
                            },
                        },
                    }
                ]
            };
            this.myCharts01.setOption(optionData1)
            this.myCharts02.setOption(optionData2)
        },

        initChart() {

            this.myCharts01 = echarts.init(document.getElementById('main2'))
            this.myCharts02 = echarts.init(document.getElementById('main3'))

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
                },
                grid: {
                    top: '15%',
                    bottom: '10%', // 调整 grid 的底部间距，给 x 轴名称留出空间
                    left: '15%',
                    right: '7%'
                },
                xAxis: [
                    {
                        type: 'category',
                        data: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
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
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: 0,
                        max: 500,
                        interval: 100,
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
                        }
                    },
                ],
            };
            var optionData2 = {
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
                },
                grid: {
                    top: '20%',
                    bottom: '15%', // 调整 grid 的底部间距，给 x 轴名称留出空间
                    left: '15%',
                    right: '7%'
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false, // 不留白，从原点开始
                        data: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
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
                        }

                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: 165,
                        max: 160,
                        interval: 1,
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
                        }
                    },
                ],
                series: [
                    {
                        name: '当前水位',
                        type: 'line',
                    },
                ]
            };
            this.myCharts01.setOption(optionData1)
            this.myCharts02.setOption(optionData2)

            this.myCharts01.showLoading({
                text: '数据正在努力加载...',
                color: 'rgba(44,226,250)', //加载时候小圆圈的颜色
                textColor: 'white',   //加载时候文本颜色
                maskColor: 'rgba(0,0,0, 0)',//加载时候的背景颜色
            });
            this.myCharts02.showLoading({
                text: '数据正在努力加载...',
                color: 'rgba(44,226,250)', //加载时候小圆圈的颜色
                textColor: 'white',//加载时候文本颜色
                maskColor: 'rgba(0,0,0, 0)',//加载时候的背景颜色
            });
        },
        //打开历史经验预报页面
        opneLsjyybPage() {
            this.lsjyybPageVisible = true;
            this.dkButtonVisible = false;

            setTimeout(() => {
                if (this.rainfalLevel.length !== 0) {
                    this.drawChart()
                } else {
                    this.initChart()
                }
            }, 100);
        },
        //关闭历史经验预报
        closeLsjyybPage() {
            this.lsjyybPageVisible = false
            this.dkButtonVisible = true;
        },
        // 在窗口大小改变时重新绘制图表
        resizeHandler() {
            this.myCharts01.resize();
            this.myCharts02.resize();
        },
    },
    beforeDestroy() {
        // 移除窗口大小改变事件的监听
        window.removeEventListener('resize', this.resizeHandler);
        // 销毁图表实例
        this.myCharts01.dispose();
        this.myCharts02.dispose();
    },

}
</script>

<style lang="scss" scoped>
.lsjyyb-page {
    position: absolute;
    right: 15px;
    top: 70px;
    width: 24%;
    height: 75%;
    min-height: 200px;
    background-color: transparent;
    z-index: 1;
    color: white;
}

.sq-button {
    position: absolute;
    left: -25px;
    color: rgb(122, 211, 237);
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.sq-button img {
    width: 18px;
    /* 设置加载图标的宽度为 18px */
}

.dk-button {
    position: absolute;
    top: 150px;
    right: 0;
    color: rgb(122, 211, 237);
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.dk-button img {
    width: 18px;
    /* 设置加载图标的宽度为 18px */
}

.el-header {
    display: flex;
    align-items: center;
    background-image: url(../../assets/image/marker/小标题头部.png);
    background-size: 100%;

}


.header-text {
    font-size: 15px;
    margin-left: 1%;
}

.el-main {
    border: solid rgb(7, 118, 172);
    background-color: rgb(11, 30, 44, 0.5);
    display: flex;
    flex-direction: column;
    padding: 0;
}

.chart1 {
    height: 100%;
    width: 99%
}

.chart2 {
    height: 100%;
    width: 99%
}
</style>