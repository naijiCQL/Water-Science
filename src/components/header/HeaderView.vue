<!--
 * @Author: 陈巧龙
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-10-09 09:27:43
 * @FilePath: \ys.skxlsyb\src\components\header\HeaderView.vue
 * @Description: 当前范围和试点水库
-->
<template>
    <div class="header-home">
        <img style="margin-left: 10px;" src="../../assets/image/marker/定位.png" />
        <div>
            <span style="margin-right: 5px;margin-left: 10px;">当前范围:</span>
            <el-input class="dqfw" v-model="input1" style="width: 200px;" :readonly="true"></el-input>
        </div>
        <div>
            <span style="margin-right: 5px;margin-left: 10px;">试点水库:</span>
            <el-select :disabled="selectRes" class="header-select" v-model="value2" placeholder="金盆水库"
                :popper-append-to-body="false" @change="handleChangeValue2">
                <el-option class="select-item" v-for="item in options1" :key="item.value" :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
import bus from '@/utils/bus'
import { getNylData, getRLData, getYdgc, gethsgc, getKbhsgc, getYjq } from "@/api/home"

export default {
    name: "headerView",
    data() {
        return {
            input1: '全湖北',
            options1: [
                {
                    value: '42128140006',
                    label: '金盆水库'
                },
                {
                    value: '42011640018',
                    label: '杨树堰水库'
                }],
            //城市编码-城市名字数据
            cityData: [
                { code: "420000", name: "全湖北" },
                { code: "420100", name: "武汉市" },
                { code: "420200", name: "黄石市" },
                { code: "420300", name: "十堰市" },
                { code: "420500", name: "宜昌市" },
                { code: "420600", name: "襄阳市" },
                { code: "420700", name: "鄂州市" },
                { code: "420800", name: "荆门市" },
                { code: "420900", name: "孝感市" },
                { code: "421000", name: "荆州市" },
                { code: "421100", name: "黄冈市" },
                { code: "421200", name: "咸宁市" },
                { code: "421300", name: "随州市" },
                { code: "422800", name: "恩施土家族苗族自治州" },
                { code: "429004", name: "仙桃市" },
                { code: "429005", name: "潜江市" },
                { code: "429006", name: "天门市" },
                { code: "429021", name: "神农架林区" },
            ],
            value2: [],
            //保存纳雨量数据
            nylData: [],
            //初始化定时器名称
            timer: null,
            //控制选择框是否禁用
            selectRes: false,
        }
    },
    mounted() {
        //接受YbszView传来的清除定时器的命令，当选择遇见期时，发出命令
        this.$bus.$on("ClearTimer", (value) => {
            if (value) {
                //清除定时器
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            }
        });

        //接受cesium/ShowResWaterPos.js来的数据
        bus.$on('selectRes', value => {
            this.selectRes = !value
        })


        //接受homeView.vue的各城市编码
        this.$bus.$on("resCode", (value) => {
            if (value) {
                this.input1 = this.getCityNameByCode(value)
            }
        });
    },
    methods: {
        //通过城市编码得到城市名字
        getCityNameByCode(code) {
            const cityCode = this.cityData.find((item) => item.code === code);
            if (cityCode) {
                return cityCode.name;
            }
        },
        //通过第二个选择框内的水库名，来保存水库的编码
        handleChangeValue2() {
            //先清除上一个定时器
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            //将水库编码保存进vuex中
            this.$store.commit('updateResCode', this.value2)
            //存入值之前对数组进行清空
            this.nylData = []
            //发送水库编码获取水库各值
            this.receiveNylData([this.value2])
            //将水库编码传递出去，用于根据水库编码锁定水库区域
            this.$bus.$emit("rc", this.value2);
            // 首先初始化执行一次
            setTimeout(() => {
                this.receiveRLData(this.value2)
            }, 500);
            // 每隔半个小时向后端发出请求
            this.timer = setInterval(() => {
                this.receiveRLData(this.value2)
            }, 30 * 60 * 1000);
            //获得堰顶高程
            this.receiveYdgc(this.value2)
            //获得设计洪水和校核洪水表格数据
            this.recivehsgc(this.value2)
            //获得遇见期时间
            this.receiveYjq(this.value2)
            //获得溃坝洪水过程数据
            //this.receiceKbhsgc([this.value2, 24])
            this.receiceKbhsgc([this.value2, this.$store.state.yjq])
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
        //向后端传递水库编码，获取纳雨量数据（不包含当前水位）
        receiveNylData(param) {
            getNylData(param).then(res => {
                this.nylData = res.data[this.value2]
                //采用this.$bus.$emit向其他组件发送数据，里面附带两个参数，前面为自定义名字，后者为所传输的数据
                this.$bus.$emit("fn", this.nylData);
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //向后端传递水库编码，获取初始化各水库的降雨和水位
        receiveRLData(param) {
            getRLData(param).then(res => {
                //将初始化的降雨-水位数据发送给历史经验预报界面
                this.$bus.$emit("initRLData", res.data);
            })
                .catch(error => {
                    console.log(error);
                    //如果后端未传值过来，则向历史经验组件传递一个null值
                    this.$bus.$emit("initRLData", null);
                });
        },
        //获得堰顶高程
        receiveYdgc(param) {
            getYdgc(param).then(res => {
                //将堰顶高程数据进行储存
                this.$store.commit('updateYdHeight', res.data)
            })
                .catch(error => {
                    console.log(error);

                });
        },
        //获得遇见期数据
        receiveYjq(param) {
            getYjq(param).then(res => {
                //将遇见期数据进行储存
                this.$store.commit('updateYjq', res.data)
            })
                .catch(error => {
                    console.log(error);

                });
        },
        //获得溃坝过程数据
        receiceKbhsgc(param) {
            getKbhsgc(param).then(res => {
                //将溃坝过程数据进行储存
                this.$store.commit('updateKbData', res.data)
            })
                .catch(error => {
                    console.log(error);

                });
        }
    },
    beforeDestroy() {
        // 最后在beforeDestroy()生命周期内清除定时器：
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
}
</script>

<style lang="scss" scoped>
.header-home {
    position: fixed;
    top: 0;
    left: 0;
    height: 30px;
    width: 700px;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: white;
    margin-top: 8px;

}

.dqfw {
    ::v-deep .el-input__inner {
        background-color: rgb(21, 45, 57, 0.4);
        color: white;
        border-color: rgb(26, 159, 239);
        border-radius: 3px;
        height: 25px;
        font-size: 14px;
        padding: 7px;
    }
}

.select-item {
    display: flex;
    align-items: center;
}

.header-select {

    ::v-deep input::-webkit-input-placeholder {
        color: white;
    }

    ::v-deep input::-moz-input-placeholder {
        color: white;
    }

    ::v-deep input::-ms-input-placeholder {
        color: white;
    }

    ::v-deep .el-select,
    ::v-deep .el-input,
    ::v-deep .el-input__inner {
        background-color: rgb(21, 45, 57, 0.4);
        color: white;
        border: rgb(26, 159, 239);
        border-radius: 3px;
        height: 25px;
        width: 200px;
    }

    ::v-deep .el-input__inner {
        background-color: rgb(21, 45, 57, 0.4);
        color: white;
        border: 0.5px solid rgb(26, 159, 239);
        border-radius: 3px;
        height: 25px;
        padding: 8px;
    }



    //修改的是el-input上下的小图标
    ::v-deep .el-input__suffix {
        top: 6px;
    }

    ::v-deep .el-input__icon {
        line-height: inherit;
    }

    ::v-deep .el-input__suffix-inner {
        display: inline-block;
    }

    //修改总体选项的样式 最外层
    ::v-deep .el-select-dropdown {
        background: rgba(24, 51, 78, 0.5);
        border: 0.5px solid rgb(26, 159, 239);
        margin-top: 0px;
    }


    //修改单个的选项的样式和设置选择栏与框内垂直对齐
    ::v-deep .el-select-dropdown__item {
        background-color: transparent;
        color: #fff;
        height: 25px;
        padding: 8px;
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

}
</style>