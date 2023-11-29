/*
 * @Author: 杨道博
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-21 17:08:42
 * @FilePath: \ys.skxlsyb\src\api\home\index.js
 * @Description: 后端接口配置
 */
import request from "../request"
// 定义变量保存路径
const apiPath = 'api/fh-admin';

//请求降雨-水位数据
export function postWaterData(params) {
    return request.post(`${apiPath}/skkr/getRainMessage`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//请求拟合数据
export function postFitData(params) {
    return request.post(`${apiPath}/skkr/getABCDE`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//请求后台默认的遇见期数据
export function getYjq(params) {
    return request.post(`${apiPath}/skkr/getYjq`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发出清空数据的指令
export function clearFitData(params) {
    return request.post(`${apiPath}/skkr/deleteAllRainWater`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//获取两个水库的纳雨量
export function getNylData(params) {
    return request.post(`${apiPath}/skkr/getReceivingRainfall`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

// 首先获取初始化的降雨和水位信息
export function getRLData(params) {
    return request.post(`${apiPath}/skkr/getFuture`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//将遇见期发送给后端
export function sendTimeData(params) {
    return request.post(`${apiPath}/skkr/saveYjq`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送湖北省的编码，接受各市水库信息
export function getResNumber(params) {
    return request.post(`${apiPath}/skkr/getSkNum`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送各城市的编码，接受该城市各个水库的经纬度信息(new)
export function getResWaterPosition(params) {
    return request.post(`${apiPath}/skkr/getSkFlag`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送有库容水库的编码，获得其水位纳雨量数据（无当前水位）
export function getResWaterNYL(params) {
    return request.post(`${apiPath}/skkr/getReceivingRainfall2`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送有库容水库的编码，获得水库当前水位
export function getCurrentWL(params) {
    return request.post(`${apiPath}/skkr/getReceivingRainfall3`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送有库容水库的编码，获得水库堰顶高程
export function getYdgc(params) {
    return request.post(`${apiPath}/skkr/getYdgc`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送有库容水库的编码和遇见期，获得设计洪水和校核洪水表格数据
export function gethsgc(params) {
    return request.post(`${apiPath}/skkr/gethsgc`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码，得到各方案描述信息
export function getResInformation(params) {
    return request.post(`${apiPath}/ymfa/getYmfaMsg`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送方案名称和水库编码，向后端发送删除指令
export function sendDelOrder(params) {
    return request.post(`${apiPath}/ymfa/deleteYmfa`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码和时间，获取淹没范围数据
export function getYMData(params) {
    return request.post(`${apiPath}/ymfa/getymfa`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码，获取外接各淹没方案的描述内容
export function getYmfaList(params) {
    return request.post(`${apiPath}/ymfa/getYmfaList`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送[方案名称，水库编码，外接网络地址]，获取外接各淹没方案
export function saveYmfaNetWork(params) {
    return request.post(`${apiPath}/ymfa/saveYmfaNetWork`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送[水库编码,时间步长]，获取溃坝分析结果
export function getKbfx(params) {
    return request.post(`${apiPath}/ymfa/getKbfx`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码，获取灾后评估报告
export function getzhpg(params) {
    return request.post(`${apiPath}/ymfa/getzhpg`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码，获取各水库淹没方案
export function getYmfaEnd(params) {
    return request.post(`${apiPath}/ymfa/getYmfaEnd`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

//发送水库编码和遇见期，获取各水库的调度方案
export function getKbhsgc(params) {
    return request.post(`${apiPath}/ymfa/getKbhsgc`, params, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

/**
 * @desc:get请求
 * @param {*} params
 * @return {*}
 */

/* export function getTemp(params) {
    return request.get('/temp/getData', { params })
} */