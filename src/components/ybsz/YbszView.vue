<!--
 * @Author: 杨道博
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-25 16:09:12
 * @FilePath: \ys.skxlsyb\src\components\ybsz\YbszView.vue
 * @Description: 预报设置
-->
<template>
    <div>
        <div>
            <!-- 添加左侧预报设置按钮 -->
            <span @click="toggleYbszPage" class="ybsz-button"> <img style="margin-top: 30px;height: 14px;"
                    src="../../assets/image/marker/预报设置.png" />预报设置</span>
        </div>
        <!-- 预报设置主页面 -->
        <el-container v-if="ybszPageVisible" class="ybsz-page">
            <!-- 上页面的布局设计 -->
            <el-header height="25px">
                <!-- 添加页面标题 -->
                <span class="header-text">预报设置</span>
                <!-- 添加取消页面标签 -->
                <span class="cancel-set" @click="closeYbszPage">
                    <img src="../../assets/image/marker/关闭.png" />
                </span>
            </el-header>
            <!-- 下页面布局设计 -->
            <el-main>
                <div style="margin-top: 4%;">
                    <label>预见期：</label>
                    <el-select class="ybsz-select" v-model="value1" placeholder='' @change="handleChangeValue1"
                        style="width: calc(100% - 153px)" :popper-append-to-body="false">
                        <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                    <button @click="onClickControl" class="yjq-set">设置</button>
                </div>
                <div>
                    <label>目标水库：</label>
                    <el-select class="ybsz-select" v-model="value2" placeholder="金盆水库" style="width: calc(100% - 247px);"
                        :popper-append-to-body="false">
                        <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="ybsz-select" v-model="value4" placeholder="第1场" @change="handleChangeValue4"
                        style="width: 70px;margin-left: 8px;padding: 0;" :popper-append-to-body="false">
                        <div style="max-height: 125px;">
                            <el-option v-for="item in options3" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </div>
                    </el-select>
                    <button class="sj-add" @click="handleButtonClick"><img src="../../assets/image/marker/添加.png"
                            style="margin-right: 5px;width: 10px;" />历史数据</button>
                </div>
                <div style="display: flex;align-items: center;">
                    <img src="../../assets/image/marker/降雨水位关系.png" />
                    <span style="font-size: 14px;font-weight: bold;width: 100px;">降雨水位关系</span>
                    <button v-if="buttonVisible" class="titleTime">{{ this.titleTime }}<img alt="Icon" class="timeimg"
                            src="../../assets/image/marker/日期.png" /></button>
                </div>
                <img style="width: 40%;margin-left: 3%;" src="../../assets/image/marker/二级标题条.png" />
                <div style="height: calc(50% - 50px)">
                    <div id="main0" class="chart1">
                    </div>
                </div>
                <div style="display: flex;justify-content: space-between;align-items: flex-end;">
                    <span style="margin-left: 5px;margin-right: calc(100% - 330px);">来水量(10⁴m³)</span>
                    <el-select multiple collapse-tags class="ybsz-select" v-model="value5" placeholder="第1场"
                        @change="handleChangeValue5" style="width: 78px;padding: 0;" :popper-append-to-body="false">
                        <div style="max-height: 125px;">
                            <el-option v-for="item in options3" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </div>
                    </el-select>
                    <button class="clear-set" @click="clearData"><img style="margin-right: 5px;vertical-align: middle;"
                            src="../../assets/image/marker/初始化图标.png" /><span
                            style="vertical-align: middle;">初始化</span></button>
                    <button class="nh-compute" @click="sendFitData"><img style="margin-right: 5px;vertical-align: middle;"
                            src="../../assets/image/marker/拟合.png" /><span
                            style="vertical-align: middle;">拟合计算</span></button>
                </div>
                <div style="height: calc(50% - 60px)">
                    <div id="main1" class="chart2">
                    </div>
                </div>
                <div style="width: 90%;margin-bottom: 10px;">
                    <span style="display: flex;justify-content: flex-end;">降雨量(mm)</span>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import XLSX from 'xlsx';
import * as echarts from 'echarts'
import { Message } from 'element-ui';
import { initMyChart01, initMyChart02, initMyChart03 } from './InitCharts'
import { postWaterData, postFitData, clearFitData, sendTimeData, gethsgc } from "@/api/home"

export default {
    name: "YbszView",
    data() {
        return {
            // 设置页面初始化为不显示状态
            ybszPageVisible: false,
            //初始化日期显示器为不显示状态
            buttonVisible: false,
            // 声明一个空的响应式对象用于接受后端所有场次的数据
            responseData: Object.create(null),
            //初始化键为1
            keys: 1,
            //初始化选择框数据
            options1: [{
                value: 6,
                label: '6小时'
            }, {
                value: 12,
                label: '12小时'
            }, {
                value: 24,
                label: '24小时'
            },
            {
                value: 72,
                label: '3天'
            },
            {
                value: 168,
                label: '7天'
            }],
            options2: [{
                value: 'jinpen',
                label: '金盆水库'
            }, {
                value: 'wuhan',
                label: '杨树堰水库'
            }],
            //用于保存降雨的场次信息，默认加载的是第一场
            options3: [
                {
                    value: 1,
                    label: '第1场'
                }
            ],
            value1: null,
            value2: [],
            value3: [],
            //储存单选框中选择的数据
            value4: [],
            //储存多选框的数据
            value5: [],
            //用于储存从后端接受的每一场时间、水位、降雨数据，每次选择进行清空
            waterData: [],
            //用于储存从后端接受的每一场的时间信息，用于横坐标的绘制和标题的显示
            timeData: [],
            //用于储存选择场次的数据，包括每场次的时间、水位、降雨数据
            fitData: [],
            //用于储存降雨量和来水量数据
            inflowData: [],
            //用于储存拟合系数
            fitCoefficient: [],
            //初始化echarts的参数
            myCharts01: null,
            myCharts02: null,
            //初始化定时器名称
            timer: null,
            //初始化时间标题信息
            titleTime: '',
        }
    },
    mounted() {
        //动画方案设置窗口打开，则这个窗口进行关闭
        this.$bus.$on("closeYbszPage", (value) => {
            if (value) {
                this.ybszPageVisible = false
            }
        });
        //初始化两个echarts图表
        initMyChart01(this.myCharts01);
        initMyChart02(this.myCharts02);
        // 监听窗口大小改变，重新绘制图表
        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler()

        this.$bus.$on("rc", (value) => {
            this.resCode = value
        });
    },
    methods: {
        //控制页面是否显示
        toggleYbszPage() {
            this.ybszPageVisible = !this.ybszPageVisible;
            this.$bus.$emit("closeDhfaszPage", true);
            if (this.ybszPageVisible) {
                setTimeout(() => {
                    initMyChart01(this.myCharts01)
                    initMyChart02(this.myCharts02);
                    if (this.waterData.length !== 0) {
                        this.drawCharts01()
                    }
                    if (this.inflowData.length !== 0) {
                        this.drawCharts02()
                    }
                }, 150);

            }
            //页面初始化设置遇见期
            this.value1 = Number(this.$store.state.yjq)
        },

        //关闭窗口
        closeYbszPage() {
            this.ybszPageVisible = false;
        },

        //打开窗口
        openYbszPage() {
            this.ybszPageVisible = true;
            if (this.ybszPageVisible) {
                setTimeout(() => {
                    this.initData()
                    if (this.waterData.length !== 0) {
                        this.drawCharts01()
                        this.drawCharts02()
                    }
                }, 100);
            }
        },

        //加载本地excel文件，并且向后端发送请求。
        handleButtonClick() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx, .xls'; // 限制接受的文件类型为Excel文件
            input.addEventListener('change', this.handleFileSelect);
            input.click();
        },

        //得到每次单选框所选择的值，并且根据key保存每场次的数据到waterData数组中，并且每次执行需要清空waterData数组数据
        handleChangeValue1() {
            //先清除上一个定时器
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            //在选择遇见期后向后端发出清除计时器的指令
            this.$bus.$emit("ClearTimer", true);
        },

        // 点击触发设置控件方法
        onClickControl() {
            // 首先执行一次
            this.sendTime(this.value1)
            //每隔一段时间向后端发出请求
            this.timer = setInterval(() => {
                this.sendTime(this.value1);
            }, 30 * 60 * 1000);
            //发送编码得到设计和校核过程数据
            this.recivehsgc(this.$store.state.resCode)
        },

        //获得设计洪水和校核洪水表格数据
        recivehsgc(param) {
            gethsgc(param).then(res => {
                this.$store.commit('updateSjjhData', res.data)
            })
                .catch(error => {
                    console.log(error);
                });

        },

        //点击设置发送遇见期
        sendTime(params) {
            sendTimeData(params).then(res => {
                if (res.data.length !== 0) {
                    //将降雨信息传递给历史经验预报界面
                    this.$bus.$emit("newRLData", res.data);
                }
            })
                .catch(error => {
                    // 请求失败处理错误
                    console.log(error);
                    this.$bus.$emit("newRLData", null);
                });
        },

        //将本地excel文件保存为json数据，并且传输给后端
        handleFileSelect(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                // 获取第一个工作表
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                // 将工作表数据转换为JSON对象
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                // 提取时间、降雨和水位数据
                const formattedData = jsonData.slice(1).map(row => {
                    const dateNumber = row[0];
                    const rainfall = row[1];
                    const waterLevel = row[2];

                    // 检查每个单元格的值是否为空
                    const date = XLSX.SSF.format('yyyy-mm-dd hh:mm:ss', dateNumber);
                    return [date, rainfall, waterLevel.toFixed(3)];
                }).filter(row => row !== null);
                //得到历史数据的json格式，将其传输给后段
                this.sendDataToBackend(formattedData);
            };
            reader.readAsArrayBuffer(file);
        },

        //向后端发送数据请求，请求数据,并且向option3填入数据，用于在select进行选择
        sendDataToBackend(params) {
            postWaterData(params).then(res => {
                this.responseData = res.data;

                this.keys = Object.keys(res.data);

                this.options3 = this.keys.map(key => {
                    return {
                        value: key,
                        label: `第${key}场`
                    };
                });
                //请求数据成功后，默认加载第一场数据
                this.showFirstData();
            })
                .catch(error => {
                    // 请求失败处理错误
                    console.log(error);
                });
        },

        //得到每次单选框所选择的值，并且根据key保存每场次的数据到waterData数组中，并且每次执行需要清空waterData数组数据
        handleChangeValue4() {
            // 获取选择的场次
            const selectedScenes = this.value4;

            // 清空data数组
            this.waterData = [];

            // 根据场次获取对应的数据对象
            const sceneData = this.responseData[selectedScenes];

            // 遍历数据对象的属性，读取时间、降雨和水位数据
            Object.keys(sceneData).forEach(key => {
                const item = sceneData[key];
                const time = item[0]; // 时间
                const rainfall = item[1]; // 降雨数据
                const waterLevel = Number(item[2]); // 水位数据

                this.waterData.push({
                    time,
                    rainfall,
                    waterLevel
                });
            });
            this.drawCharts01();
        },

        handleChangeValue5() {
            const selectedScenes = this.value5;

            // 将选择的场次信息转换为数组形式
            const selectedData = selectedScenes.map(scene => {
                // 根据场次获取对应的数据对象
                const sceneData = this.responseData[scene];

                // 遍历数据对象的属性，读取时间、降雨和水位数据
                const sceneArray = Object.keys(sceneData).map(key => {
                    const item = sceneData[key];
                    const time = item[0]; // 时间
                    const rainfall = String(item[1]); // 降雨数据
                    const waterLevel = (Number(item[2]) + 20).toFixed(3); // 水位数据waterLevel.toFixed(3)

                    return {
                        time,
                        rainfall,
                        waterLevel
                    };
                });
                return sceneArray;
            });

            // 更新fitData数组
            this.fitData = selectedData;
        },

        //发送场次降雨进行拟合，并且接受降雨量-来水量数据
        sendFitData() {
            postFitData(this.fitData).then(res => {
                //将后端传来的数据去掉后三项，保留其余数据保存在数组里面
                this.inflowData = res.data.slice(0, -3);
                //取后三项数据数组第二个值保存进一维数组中
                this.fitCoefficient = res.data.slice(-3).map(item => item[1]);

                this.drawCharts02()
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //初始化默认加载第一场数据
        showFirstData() {

            // 根据场次获取对应的数据对象
            const sceneData = this.responseData[1];

            // 遍历数据对象的属性，读取时间、降雨和水位数据
            Object.keys(sceneData).forEach(key => {
                const item = sceneData[key];
                const time = item[0]; // 时间
                const rainfall = item[1]; // 降雨数据
                const waterLevel = Number(item[2]); // 水位数据

                this.waterData.push({
                    time,
                    rainfall,
                    waterLevel
                });
            });

            this.drawCharts01();
        },

        //向后端发送指令，目的为了清空数据库中上一拟合的数据和参数，并且初始化图表
        clearData() {
            clearFitData('yes').then(res => {

                //将上一个绘制的图表进行清空
                if (this.myCharts02) {
                    this.myCharts02.dispose();
                }
                //再加载初始化表格
                initMyChart03(this.myCharts02);
                //输出成功执行的消息
                Message({
                    message: res.data,
                    type: 'success'
                });
            })
                .catch(error => {
                    console.log(error);
                    Message.error('初始化数据失败！');
                });
        },

        //在预报设置里绘制降雨-水位的echarts图，并且做相应的配置
        drawCharts01() {
            this.myCharts01 = echarts.init(document.getElementById('main0'))

            //得到降每场次降雨的最大最小值，用于设置y轴的间距
            const maxRainfall = Math.ceil(Math.max(...(this.waterData.map(d => d.rainfall)))) + 1
            const minRainfall = Math.floor(Math.min(...(this.waterData.map(d => d.rainfall))))

            //得到降每场次水位的最大最小值，用于设置y轴的间距
            const maxWaterLevel = Math.ceil(Math.max(...(this.waterData.map(d => d.waterLevel)))) + 1
            const minWaterLevel = Math.floor(Math.min(...(this.waterData.map(d => d.waterLevel)))) - 1

            //将两条纵坐标分为五等分
            let rainfallInterval = (maxRainfall - minRainfall) / 5;
            let WaterLevelInterval = (maxWaterLevel - minWaterLevel) / 5;

            //将每场的时间存放进指定的数组内
            this.timeData = this.waterData.map(d => d.time)

            // 提取起始日期和结束日期作为标题，并且只取日期的年份数据
            const startDate = this.timeData[0].split(' ')[0];
            const endDate = this.timeData[this.timeData.length - 1].split(' ')[0];
            const title = `${startDate} - ${endDate}`;

            //在数据加载后再显示首尾时间
            this.titleTime = title
            this.buttonVisible = true

            //遍历降雨数组，并且数组每个值加上0.3，由于会发生数据精度丢失，于是精确两位，并且转为数字类型
            let seriesData = this.waterData.map(d => d.rainfall).map(value => {
                return (value + rainfallInterval / 5) 
            });

            //绘制第一个表格数据
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
                    top: '25%',
                    bottom: '15%',
                    right: '15%',
                    left: '12%',
                },
                legend: [
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "10%",
                        data: [{ name: '降雨量(mm)' }],
                        itemWidth: 10, //矩形宽度
                        itemHeight: 10, //矩形高度
                        left: '23%'
                    },
                    {
                        textStyle: {
                            fontSize: 12,//字体大小
                            color: 'rgb(165,200,231)'//字体颜色
                        },
                        top: "10%",
                        data: [{ name: '水位(m)', icon: '', },],
                        itemWidth: 10, //矩形宽度
                        itemHeight: 1, //矩形高度
                        right: '23%'
                    },

                ],
                dataZoom: [{
                    endValue: 8,
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
                        //提取日期数据的时间信息，用于绘制x轴
                        data: this.timeData.map(d => d.split(' ')[1]),
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,//代表显示所有x轴标签显示
                            show: true,
                            textStyle: {
                                color: 'white',
                                fontSize: 8.5 // 设置字体大小为5
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
                        name: '降雨量',
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
                                return value.toFixed(2);
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
                    {
                        type: 'value',
                        name: '水位',
                        min: minWaterLevel,
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
                                return value.toFixed(2);
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
                        name: '降雨量(mm)',
                        type: 'bar',
                        yAxisIndex: 0,//指定第一个纵坐标轴
                        barWidth: 15, // 设置柱状图的宽度
                        tooltip: {
                            valueFormatter: function (value) {
                                return (value - rainfallInterval / 5).toFixed(2);
                            }
                        },
                        data: seriesData,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgb(11,129,254)' },
                                { offset: 1, color: 'rgb(20,203,248)' }
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
                                //坐标注当数值为0.3则显示0，不为0则减去0.3，也存在精度丢失
                                formatter: function (params) {
                                    return Number((params.value - rainfallInterval / 5).toFixed(2));
                                },
                            }
                        }

                    },
                    {
                        name: '水位(m)',
                        type: 'line',
                        yAxisIndex: 1, // 指定使用第二个纵坐标轴
                        symbol: 'none', // 不显示圆点
                        smooth: true,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.waterData.map(d => d.waterLevel),
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

        //根据一元二次方程和系数求解y值
        calculateQuadraticFunctionY(x) {
            const [a, b, c] = this.fitCoefficient;
            return a * x * x + b * x + c;
        },

        //绘制降雨量和来水量的拟合曲线图
        drawCharts02() {
            this.myCharts02 = echarts.init(document.getElementById('main1'))

            const xData = this.inflowData.map(item => item[0]);
            const yData = this.inflowData.map(item => item[1]);

            const xTickMin = Math.floor(Math.min(...xData));
            const xTickMax = Math.ceil(Math.max(...xData));
            const yTickMin = Math.floor(Math.min(...yData));
            const yTickMax = Math.ceil(Math.max(...yData));

            // 计算曲线上的点的坐标
            const curveData = [];
            const step = (xTickMax - xTickMin) / 100; // 曲线的采样步长
            for (let x = xTickMin; x <= xTickMax; x += step) {
                const y = this.calculateQuadraticFunctionY(x); // 计算对应的 y 值
                curveData.push([x, y]);
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
                grid: {
                    top: '15%',
                    bottom: '10%', // 调整 grid 的底部间距，给 x 轴名称留出空间
                    left: '12%',
                    right: '12%'
                },
                xAxis: [
                    {
                        type: 'value',
                        min: xTickMin,
                        max: xTickMax,
                        splitNumber: 10,
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
                        min: yTickMin,
                        max: yTickMax,
                        splitNumber: 5,
                        interval: (yTickMax - yTickMin) / 5,
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
                    }
                ],
                series: [
                    {
                        symbolSize: 5,
                        data: this.inflowData,
                        type: 'scatter',
                        itemStyle: {
                            color: 'rgb(57,246,255)'
                        },
                    },
                    {
                        data: curveData,
                        type: 'line',
                        symbol: 'none', // 不显示圆点
                        lineStyle: {
                            color: 'rgb(63,234,244,0.8)', // 设置曲线的颜色
                        },
                        tooltip: {
                            valueFormatter: function (value) {
                                return '来水量：' + value.toFixed(2) + ' m³';
                            }
                        },
                    }
                ]
            };
            this.myCharts02.setOption(optionData2)
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
        this.myCharts01.dispose();
        this.myCharts02.dispose();

        // 最后在beforeDestroy()生命周期内清除定时器：
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
}
</script>

<style lang="scss" scoped>
.ybsz-button {
    position: absolute;
    top: 70px;
    color: rgb(122, 211, 237);
    width: 23px;
    height: 140px;
    font-size: 13px;
    background-image: url(../../assets/image/marker/菜单切换.png);
    background-size: 23px 140px;
    /* 设置高度为 140px，宽度自动适应 */
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.ybsz-page {
    position: absolute;
    left: 32px;
    top: 70px;
    width: 24%;
    height: 83%;
    min-height: 200px;
    z-index: 1;
    color: white;
    box-sizing: border-box
}

.cancel-set {
    position: absolute;
    font-size: 20px;
    font-weight: bold;
    right: 10px;
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.el-header {
    display: flex;
    align-items: center;
    background-image: url(../../assets/image/marker/小标题头部.png);
    background-size: 100%;
}


.header-text {
    font-size: 15px;
    margin-left: 5px;
}

.el-main {
    border: solid rgb(7, 118, 172);
    background-color: rgb(11, 30, 44, 0.5);
    display: flex;
    flex-direction: column;
    padding: 0;
}

label {
    display: inline-block;
    text-align: right;
    width: 65px;
    margin-left: 10px;
    margin-bottom: 15px;
}


//设置样式
.yjq-set {
    background-image: url(../../assets/image/marker/设置按钮.png);
    background-color: transparent;
    background-size: 100% 100%;
    color: white;
    height: 25px;
    border: 0;
    margin-left: 8px;
    width: 60px;
    border-radius: 2px;
    font-size: 10px;
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

//初始化样式
.clear-set {
    background-image: url(../../assets/image/marker/初始化.png);
    background-color: transparent;
    background-size: 100% 100%;
    color: white;
    height: 25px;
    border: 0;
    width: 70px;
    border-radius: 2px;
    font-size: 10px;
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.sj-add {
    background-image: url(../../assets/image/marker/历史数据.png);
    background-color: transparent;
    background-size: 100% 100%;
    color: white;
    border: 0;
    height: 25px;
    margin-left: 8px;
    width: 75px;
    border-radius: 2px;
    font-size: 10px;
    vertical-align: middle;
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

//设置拟合计算按钮样式
.nh-compute {
    background-image: url(../../assets/image/marker/历史数据.png);
    background-color: transparent;
    background-size: 100% 100%;
    color: white;
    border: 0;
    height: 25px;
    width: 80px;
    border-radius: 2px;
    font-size: 10px;
    margin-right: 12px;
    cursor: pointer;
    /* 设置光标样式为手型（指针） */
}

.titleTime {
    background-color: transparent;
    color: white;
    height: 25px;
    border: 0.5px solid rgb(75, 167, 201);
    margin-left: calc(100% - 330px);
    width: 175px;
    border-radius: 2px;
    font-size: 12px;
}

.timeimg {
    width: 12px;
    margin-left: 5px;
    margin-right: 3px;
    vertical-align: middle;
    filter: brightness(0) invert(1);
}

.chart1 {
    height: 99%;
    width: 99%;
    position: relative;
    z-index: 5;
}

.chart2 {
    height: 99%;
    width: 99%;
    position: relative;
    z-index: 5;
}

.ybsz-select {

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