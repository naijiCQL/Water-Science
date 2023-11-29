/*
 * @Author: 陈巧龙
 * @Date: 2023-08-25 10:20:22
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-08-25 11:11:47
 * @FilePath: \ys.skxlsyb\src\components\ybsz\InitCharts.js
 * @Description: 初始化echarts图表
 */
import * as echarts from 'echarts'

/**
 * @description: 初始化图表一，无数据
 * @param {*} myCharts01
 * @return {*}
 */
export function initMyChart01(myCharts01) {
    myCharts01 = echarts.init(document.getElementById('main0'))

    var optionData1 = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        grid: {
            top: '25%',
            bottom: '15%'
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
        xAxis: [
            {
                type: 'category',
                data: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],
                axisLabel: {
                    interval: 0, // 显示所有刻度
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
                name: '降雨量',
                min: 0,
                max: 30,
                interval: 5,
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
            {
                type: 'value',
                name: '水位',
                min: 20,
                max: 80,
                interval: 10,
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
                name: '降雨量(mm)',
                type: 'bar',
                yAxisIndex: 0, // 指定使用第一个纵坐标轴
                barWidth: 15, // 设置柱状图的宽度
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgb(11,129,254)' },
                        { offset: 1, color: 'rgb(20,203,248)' }
                    ]),
                },

            },
            {
                name: '水位(m)',
                type: 'line',
                yAxisIndex: 1, // 指定使用第二个纵坐标轴
                symbol: 'none', // 不显示圆点
                tooltip: {
                    valueFormatter: function (value) {
                        return value;
                    }
                },
                lineStyle: {
                    type: 'dashed', // 虚线样式
                    width: 2, // 线宽
                    color: 'yellow'
                },

            },
        ]
    };
    myCharts01.setOption(optionData1)
}

/**
 * @description: 根据一元二次方程和系数求解y值
 * @param {*} x
 * @return {*}
 */
function initCalculateQuadraticFunctionY(x) {
    return 0.019141 * x * x - 0.257241 * x + 0.991924;
}

/**
 * @description: 初始化图表二，给图表二初始化一组默认数据
 * @param {*} myCharts02
 * @return {*}
 */
export function initMyChart02(myCharts02) {
    myCharts02 = echarts.init(document.getElementById('main1'))

    // 计算曲线上的点的坐标
    const curveData = [];
    const step = 32 / 100; // 曲线的采样步长
    for (let x = 1; x <= 33; x += step) {
        const y = initCalculateQuadraticFunctionY(x); // 计算对应的 y 值
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
            right: '10%'
        },
        xAxis: [
            {
                type: 'value',
                min: 1,
                max: 33,
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
                min: 0,
                max: 7,
                splitNumber: 5,
                interval: 7 / 5,
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
                data: [
                    [
                        5.4,
                        0.43
                    ],
                    [
                        3.7,
                        0.16
                    ],
                    [
                        12.3,
                        0.16
                    ],
                    [
                        17.09,
                        0.5
                    ],
                    [
                        14.4,
                        1.13
                    ],
                    [
                        29.29,
                        6.46
                    ],
                    [
                        32.39,
                        4.4
                    ],
                    [
                        6.4,
                        1
                    ],
                    [
                        3.4,
                        0.43
                    ],
                    [
                        1,
                        0.19
                    ],
                    [
                        17.5,
                        0.19
                    ]
                ]
                ,
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
                        return '来水量：' + value.toFixed(2) + ' 10⁴m³';
                    }
                },
            }
        ]
    };
    myCharts02.setOption(optionData2)
}

/**
 * @description: 初始化图表2，无数据
 * @param {*} myCharts02
 * @return {*}
 */
export function initMyChart03(myCharts02) {
    myCharts02 = echarts.init(document.getElementById('main1'))

    var optionData2 = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                },
            },
        },
        grid: {
            top: '15%',
            bottom: '10%', // 调整 grid 的底部间距，给 x 轴名称留出空间
            left: '12%',
            right: '10%'
        },
        xAxis: [
            {
                type: 'value',
                min: 1,
                max: 33,
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
                min: 0,
                max: 5,
                splitNumber: 5,
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
            }
        ],
    };
    myCharts02.setOption(optionData2)
}