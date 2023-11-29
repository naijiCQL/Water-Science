<!--
 * @Author: 陈巧龙
 * @Date: 2023-08-10 10:19:11
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-19 10:10:24
 * @FilePath: \ys.skxlsyb\src\components\dhfasz\DhfaszView.vue
 * @Description: 动画方案设置
-->
<template>
    <div>
        <div>
            <!-- 添加动画方案设置按钮 -->
            <span class="dhfasz-button" @click="toggleDhfaszPage"> <img style="margin-top: 35px;height: 14px;"
                    src="../../assets/image/marker/动画选.png" />动画方案设置</span>
        </div>
        <!-- 播放设置主页面 -->
        <el-container class="dhfasz-page" v-if="dhfaszPageVisible">
            <!-- 上页面的布局设计 -->
            <el-header height="25px">
                <!-- 添加页面标题 -->
                <span class="header-text">动画方案设置</span>
                <!-- 添加取消页面标签 -->
                <span class="cancel-set" @click="closeDhfaszPage">
                    <img src="../../assets/image/marker/关闭.png" />
                </span>
            </el-header>
            <!-- 下页面布局设计 -->
            <el-main>
                <div style="margin-top: 4%;">
                    <label>
                        <span class="required">*</span>
                        方案名称：
                    </label>
                    <el-input class="fnsrk" v-model="input1" style="width: calc(100% - 235px)"
                        @change="handleChangeInput1"></el-input>
                    <el-select class="header-select" v-model="value1" placeholder="选择水库" :popper-append-to-body="false"
                        style="width: 120px;margin-left: 5px;" @change="handleChangeValue1">
                        <el-option class="select-item" v-for="item in options1" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div>
                    <label>
                        <span class="required">*</span>
                        模型文件：
                    </label>
                </div>
                <div style="display: flex;margin-bottom: 10px">
                    <el-radio class="fasz" v-model="radio" label="1" style="margin-top: 5px;">本地上传</el-radio>
                    <el-input class="fnsrk" v-model="input2" style="width: calc(100% - 175px)" :readonly="true"></el-input>
                    <el-upload class="upload-demo" action="api/ymfa/saveymfa" :on-success="handleUploadSuccess"
                        :headers="headers" :data="uploadData" accept=".hdf" :on-change="handleChange">
                        <el-button :disabled="radio !== '1'" class="sj-add"><img src="../../assets/image/marker/添加.png"
                                style="margin-right:5px;width: 10px;" />添加</el-button>
                    </el-upload>
                </div>
                <div>
                    <el-radio class="fasz" v-model="radio" label="2">远程地址</el-radio>
                    <el-input class="fnsrk" v-model="input3" style="width: calc(100% - 175px)" :readonly="true"></el-input>
                    <el-popover placement="right" trigger="click" popper-class="myPopover">
                        <el-table :data="gridData" stripe height="100%"
                            style="background:transparent;max-height: calc(100% - 5px); overflow: auto">
                            <el-table-column min-width="5%">
                                <template slot-scope="scope">
                                    <el-radio class="select-radio" :label="scope.row.id" v-model="radioId"
                                        @change="handleSelect(scope.row)"
                                        style="margin: 0px;margin-left: 23%;display: flex;align-items: center;justify-content: flex-start;"></el-radio>
                                </template>
                            </el-table-column>
                            <el-table-column prop="name" label="方案名称" min-width="40%">
                            </el-table-column>
                            <el-table-column prop="time" label="起止时间" min-width="20%">
                            </el-table-column>
                            <el-table-column prop="resName" label="所属水库" min-width="32%">
                            </el-table-column>
                        </el-table>
                        <el-button :disabled="radio === '1'" class="sj-add" slot="reference"><img
                                src="../../assets/image/marker/选择.svg" style="margin-right:5px;width: 8px;" />选择</el-button>
                    </el-popover>
                </div>
                <div style="display:flex;justify-content:flex-end;margin-right:5px">
                    <el-button :disabled="radio === '1'" class="jxcj" @click="sendChooseData">解析创建</el-button>
                </div>
                <div style="height: calc(100% - 205px);">
                    <el-table :data="tableData" stripe height="100%"
                        style="background:transparent;margin-left:10px;margin-right:12px;width: calc(100% - 22px);max-height: calc(100% - 10px); overflow: auto">
                        <el-table-column min-width="8%">
                            <template slot-scope="scope">
                                <el-radio class="select-radio" :label="scope.row.id" v-model="radioId1"
                                    @change="handleSelect(scope.row)"
                                    style="margin: 0px;margin-left: 23%;display: flex;align-items: center;justify-content: flex-start;"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="方案名称" min-width="20%">
                        </el-table-column>
                        <el-table-column prop="time" label="起止时间" min-width="35%">
                        </el-table-column>
                        <el-table-column prop="resName" label="所属水库" min-width="25%">
                        </el-table-column>
                        <el-table-column label="操作" min-width="28%">
                            <template slot-scope="scope">
                                <el-button class="cz-button" @click="togglePlayStop(scope.row)">{{ scope.row.isPlaying ?
                                    '停止' : '播放'
                                }}</el-button>
                                <el-button class="cz-button" @click="handleDelete(scope.row, scope.$index)"
                                    style="color:red">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui';
import { formatDate } from "../cesium/ShowFloodRun"
import { getResInformation, sendDelOrder, getYmfaList, saveYmfaNetWork } from "@/api/home"

export default {
    name: "YbszView",
    data() {
        return {
            //控制页面是否显示
            dhfaszPageVisible: false,
            input1: '',
            input2: '',
            input3: '',
            options1: [{
                value: '42128140006',
                label: '金盆水库'
            },
            {
                value: '42011640018',
                label: '杨树堰水库'
            }],
            value1: [],
            //用于保存所选择书库的label，将其保存起来
            resLabel: [],
            //用于保存[方案名称，水库编码]，用于发送后端，进行方案的删除
            delMessage: [],
            radio: '1',
            //表格数据
            tableData: [],
            //设置上传的请求头
            headers: {
                Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJBRE1JTiIsIlVzZXJJZCI6IjEiLCJzY29wZSI6WyJhbGwiXSwiVXNlclJlYWxOYW1lIjoi6LaF57qn566h55CG5ZGYIiwiVXNlclh6cWhkbSI6IjQyMDUiLCJleHAiOjI1MTk3NzIwMTAsImp0aSI6ImExNTcxYzk1LTBkNjMtNDkyYi1iOWEyLTE2ZTIzNTQ5ZTY1ZiIsImNsaWVudF9pZCI6InVzZXItc2VydmljZSJ9.ebNVZrw9LbhKaj2w6RR8b2wccQiDkhvBeq79SxxCK-yWiOlIFqBkotTN4TNJg8umcpyYvLILwvqXWRJhffEtgi25sX2y6MqLIWM4kMZ9d8ptdnSmTpBPhltSiQOM0KFa1kl5nSDCBwYOLn-pESJglam76cjpgZNoC88x3iNHacdiXDItY0rtY85HrQ26uyJu9UovKtmYmZRHsIbGMpDta5Q1p4vfaCIr-YUayDrCweZJiQDEEcOSpWJ7O7RMk3pRkX_4UmPHFzrOI2lMp1jQIhxnSTE7EVAz_4z8h8r46muSkpF54Ic4XSawHKqdSLHx8T05LB0MpvOzWMPS6c1uHA"
            },
            // 上传文件附带对象数据
            uploadData: {
                key1: [],
            },
            //用于保存[方案名称，开始时间，水库编码]，用于向后端发送获取淹没数据
            ymData: [],
            //用于储存上个淹没方案的名称+当前淹没时间+结束时间
            currentNameTime: [],
            //弹出框中选择框的数据
            gridData: [],
            //保存选择框中所选择数据的id
            radioId: 0,
            //保存选择框中所选择数据的id
            radioId1: 0,
            //保存选择框中所选择的数据
            selection: [],
            //时间步长
            timeStep: null
        }
    },
    mounted() {
        //接受cesium组件传来的数组
        this.$bus.$on("currentNameTime", (value) => {
            this.currentNameTime = value
        });

        //预报设置窗口打开，则这个窗口进行关闭
        this.$bus.$on("closeDhfaszPage", (value) => {
            if (value) {
                this.dhfaszPageVisible = false
            }
        });
    },
    methods: {
        //打开或关闭窗口
        toggleDhfaszPage() {
            this.dhfaszPageVisible = !this.dhfaszPageVisible
            this.$bus.$emit("closeYbszPage", true);
        },
        //关闭窗口
        closeDhfaszPage() {
            this.dhfaszPageVisible = false
        },
        handleChangeInput1(inputValue) {

            //将向后端发送的对象清空
            this.uploadData.key1 = []

            //保存输入框的值和所选择水库的编码
            this.uploadData.key1.push(inputValue.trim());
            this.uploadData.key1.push(this.value1);
        },
        //获取所选择的水库编码
        handleChangeValue1() {
            //得到所选择水库的label
            const selectedItem = this.options1.find(item => item.value === this.value1);
            if (selectedItem) {
                this.resLabel = selectedItem.label;
            }
            //将向后端发送的对象清空
            this.uploadData.key1 = []
            //保存输入框的值和所选择水库的编码
            this.uploadData.key1.push(this.input1.trim());
            this.uploadData.key1.push(this.value1);
            //将水库编码发送给后端得到各方案描述信息
            this.getResYMMessage(this.value1)

            this.ymData = []

            this.receiveYMfaList(this.value1)
        },

        //将上传文件的名字保存进输入框内
        handleChange(file) {
            this.input2 = file.name
            // 选择文件后手动上传
            if (file && file.length > 0) {
                this.$refs.uploadRef.submit();
            }
        },

        //上传成功后，得到后端的指令，并且进行新的数据请求
        handleUploadSuccess(response) {
            MessageBox.alert(response.data, '提示', {
                confirmButtonText: '确定',
            });
            this.getResYMMessage(this.value1)
        },

        //向后端发送请求，接受各淹没方案描述信息
        getResYMMessage(param) {
            let idCounter = 0;
            getResInformation(param).then(res => {
                this.tableData = res.data.map(item => ({
                    id: idCounter++,
                    name: item.name,
                    time: item.startTime,
                    resName: this.resLabel,
                    timeStep: item.bc
                }));
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //将所选择行的数据进行发送
        sendChooseData() {
            this.input3 = this.selection.fileAddress
            //向后端发送数据，用于接受外接解析数据
            const parseData = [`方案${this.selection.id + 1}`, this.value1, this.selection.fileAddress]
            this.getYmfaNetWork(parseData)
        },

        //保存弹出框中选择框所选择的数据
        handleSelect(row) {
            this.radioId = row.id
            this.selection = row
        },

        //向后端发送当前水库编码，获得外接各淹没方案
        receiveYMfaList(param) {
            let idCounter = 0;
            getYmfaList(param).then(res => {
                this.gridData = res.data.map(item => ({
                    id: idCounter++,
                    name: item.fileName,
                    time: item.startDate,
                    resName: this.resLabel,
                    fileAddress: item.fileAddress,
                }))
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //发送[方案名称，水库编码，外接网络地址]，获取外接各淹没方案
        getYmfaNetWork(param) {
            saveYmfaNetWork(param).then(res => {
                Message({
                    message: res.data,
                    type: 'success'
                });
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //发送删除指令，得到删除成功的信息
        delFAMessage(param) {
            sendDelOrder(param).then(res => {
                Message({
                    message: res.data,
                    type: 'success'
                });
            })
                .catch(error => {
                    console.log(error);
                });
        },

        //使用 this.$set 修改数据达到切换播放与停止状态
        togglePlayStop(row) {
            //将每个方案的时间步长进行保存
            this.timeStep = Number(row.timeStep)
            this.$bus.$emit("ymTimeStep", this.timeStep);

            this.$set(row, 'isPlaying', !row.isPlaying);
            if (row.isPlaying) {
                /* 
                如果new Date(this.currentTime).getTime()等于0表示当前时间为开始时间，河流水面绘制时间从开始时间起
                如果new Date(this.currentTime).getTime()不等于0表示存在当前时间，即前面停止过，河流水面绘制时间从当前时间起
                 */
                var startTime = new Date(row.time)
                let currentTime = new Date(this.currentNameTime[1]).getTime() - this.timeStep * 60 * 1000
                let endTime = new Date(this.currentNameTime[2]).getTime()

                if (this.currentNameTime[0] === row.name && currentTime !== endTime) {
                    //保存数据前进行清空数组
                    this.ymData = []
                    //将新的[方案名称，开始时间，水库编码]保存进数组
                    this.ymData.push(row.name, this.currentNameTime[1], this.value1)
                    //将数据发送给cesium组件，用于地图定位和淹没效果绘制
                    this.$bus.$emit("faData", this.ymData);
                } else {
                    //保存数据前进行清空数组
                    this.ymData = []
                    //将[方案名称，开始时间，水库编码]保存进数组
                    this.ymData.push(row.name, formatDate(startTime), this.value1)
                    //将数据发送给cesium组件，用于地图定位和淹没效果绘制
                    this.$bus.$emit("faData", this.ymData);
                }
            } else {
                //发出关闭的指令
                this.$bus.$emit("runStop", true);
            }
        },

        // 删除表格数据
        handleDelete(row, index) {
            MessageBox.confirm('确定要删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //清空选择的数组
                this.delMessage = []
                //将[方案名称、水库编码]进行保存到数组里面
                this.delMessage.push(row.name, this.value1)
                //将这一行信息从列表进行删除
                this.tableData.splice(index, 1);

                //向后端发送删除信息的指令
                this.delFAMessage(this.delMessage)
            }).catch(() => {
                // 用户点击了取消按钮，不执行任何操作
            });
        },
    },
    beforeDestroy() {

    },
}
</script>

<style lang="scss">
// 修改弹出框中表格的属性
.myPopover {
    top: 70px !important;
    left: 26% !important;
    height: 40%;
    width: 25%;
    background-color: rgba(11, 30, 44, 0.5);
    border: solid rgb(7, 118, 172);

    .el-table th {
        background: rgba(11, 113, 153) !important;
        color: white;
        font-size: 14px;
    }

    .el-table tr {
        background: transparent !important;
        color: white;
        font-size: 10px;
    }

    .el-table td.el-table__cell,
    .el-table th.el-table__cell.is-leaf {
        border-bottom: none
    }

    .el-table--striped .el-table__body tr.el-table__row--striped td {
        background: rgba(20, 65, 84);
    }

    .el-table--enable-row-hover .el-table__body tr:hover>td {
        background-color: rgba(4, 224, 232, 0.3);
    }

    .el-table::before {
        height: 0px;
    }

    .el-table .cell {
        white-space: pre-line;
    }

}

.el-popper[x-placement^=right] .popper__arrow::after {
    border-right-color: transparent !important;
}

.el-popper[x-placement^=right] .popper__arrow {
    border-right-color: transparent !important;
}
</style>

<style lang="scss" scoped> //侧栏动画方案设置的按钮
 .dhfasz-button {
     position: absolute;
     top: 190px;
     color: rgb(122, 211, 237);
     width: 23px;
     height: 185px;
     font-size: 13px;
     background-image: url(../../assets/image/marker/菜单切换.png);
     background-size: 23px 185px;
     /* 设置高度为 140px，宽度自动适应 */
     cursor: pointer;
     /* 设置光标样式为手型（指针） */
 }

 //动画方案设置主页面样式
 .dhfasz-page {
     position: absolute;
     left: 32px;
     top: 70px;
     width: 24%;
     height: 80%;
     min-height: 200px;
     z-index: 1;
     color: white;
     box-sizing: border-box
 }

 //header样式设置
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

 .cancel-set {
     position: absolute;
     font-size: 20px;
     font-weight: bold;
     right: 10px;
     cursor: pointer;
     /* 设置光标样式为手型（指针） */
 }

 //main样式设置
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
     width: 75px;
     margin-left: 25px;
     margin-bottom: 15px;
 }

 .required {
     color: red;
 }

 //添加按钮样式设置
 .sj-add {
     background-image: url(../../assets/image/marker/历史数据.png);
     background-color: transparent;
     background-size: 100% 100%;
     color: white;
     border: 0;
     height: 25px;
     margin-left: 5px;
     width: 60px;
     border-radius: 2px;
     font-size: 10px;
     vertical-align: middle;
     cursor: pointer;
 }

 //解析创建按钮样式设置
 .jxcj {
     background-image: url(../../assets/image/marker/解析创建.png);
     background-color: transparent;
     background-size: 100% 100%;
     color: white;
     border: 0;
     height: 25px;
     width: 100px;
     border-radius: 2px;
     font-size: 10px;
     display: flex;
     align-items: center;
     justify-content: center;
     margin: 7px;
     margin-bottom: 15px;
     cursor: pointer;
 }

 .cz-button {
     background: transparent;
     color: rgba(0, 188, 245);
     height: 25px;
     width: 30px;
     border-radius: 2px;
     font-size: 10px;
     border: none;
     margin: 0;
     padding: 0;
     cursor: pointer;
 }

 //设置单选框样式
 ::v-deep .el-radio {
     margin-left: 16px;
     margin-bottom: 12px;
     margin-right: 8px
 }

 //设置表格的表头样式
 ::v-deep .el-table th {
     background: rgba(7, 110, 151);
     color: white;
     font-size: 5px;
 }

 //设置表格样式
 ::v-deep .el-table tr {
     background: transparent;
     color: white;
     font-size: 5px;
 }

 //设置斑马表格的颜色
 ::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
     background: rgba(20, 65, 84);
 }

 //设置表格中的间距
 ::v-deep .el-table .el-table__cell {
     padding: 5px;
     padding-left: 0px;
     font-size: 12px;
 }

 // 修改表格的文本对齐和内边距
 ::v-deep .el-table,
 ::v-deep th.el-table__cell>.cell {
     text-align: center;
     padding: 0;
     font-size: 12px;
 }

 //修改表格单元格文本对齐和内边距
 ::v-deep .el-table,
 ::v-deep .cell {
     text-align: center;
     padding: 0;
     white-space: pre-line;
 }

 //修改表格前面的元素高度，实现隐藏表格边框
 ::v-deep .el-table::before {
     height: 0
 }

 //删除行内间直线
 ::v-deep .el-table td,
 .building-top .el-table th.is-leaf {
     border-bottom: 0;
 }

 //删除表头直线
 ::v-deep .el-table td.el-table__cell,
 ::v-deep .el-table th.el-table__cell.is-leaf {
     border-bottom: 0;
 }

 //鼠标停在处进行高亮显示
 ::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
     background-color: rgba(4, 224, 232, 0.3);
 }

 //修改upload下方加载的样式
 ::v-deep .el-upload-list__item-name {
     width: 60px;
     margin-right: 15px;
     color: white;
     display: none;
 }

 //修改进度条样式
 ::v-deep .el-upload-list__item,
 .el-progress {
     top: -30px;
     display: none;
 }

 ::v-deep .el-upload-list__item-status-label {
     display: none;
 }

 //修改button样式
 ::v-deep .el-button {
     padding: 0;
 }

 /*按钮悬浮*/
 ::v-deep .el-button:hover {
     background: #126c9e !important;
 }

 /*按钮点击*/
 ::v-deep .el-button:focus {
     background-color: transparent;
 }

 .fasz {

     /* 自定义单选框标签样式 */
     ::v-deep .el-radio__label {
         color: white;
         /* 文本颜色为白色 */
         font-size: 13px;
         /* 字体大小为 13 像素 */
     }

     /* 自定义单选框外观 */
     ::v-deep .el-radio__inner {
         border: 1px solid rgba(65, 168, 191);
         background-color: rgba(15, 53, 71);
     }

     /* 自定义单选框选中状态的样式 */
     ::v-deep .el-radio__inner::after {
         width: 6px;
         height: 6px;
         background-color: rgba(6, 222, 232);
     }
 }

 .select-radio {

     /* 自定义单选框标签样式 */
     ::v-deep .el-radio__label {
         color: white;
         /* 文本颜色为白色 */
         font-size: 13px;
         display: none;
     }

     /* 自定义单选框外观 */
     ::v-deep .el-radio__inner {
         border: 1px solid rgba(65, 168, 191);
         background-color: rgba(15, 53, 71);
     }

     /* 自定义单选框选中状态的样式 */
     ::v-deep .el-radio__inner::after {
         width: 6px;
         height: 6px;
         background-color: rgba(6, 222, 232);
     }

 }

 //设置输入框内部样式
 .fnsrk {
     ::v-deep .el-input__inner {
         background-color: rgb(21, 45, 57, 0.4);
         color: white;
         border-color: rgb(26, 159, 239);
         border-radius: 3px;
         height: 25px;
         font-size: 10px;
         padding: 5px;
     }
 }

 //修改选择框内数据的样式
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